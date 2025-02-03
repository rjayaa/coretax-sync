// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { 
  taxInvoiceHeader, 
  taxInvoiceDetail,
  taxInvoiceStatus,
  taxMasterCustomer,
  taxMasterCompany,
  taxUserRoles
} from '@/lib/db/schema/tax';
import { eq, and, sql, between, inArray, desc } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import uuidv4, { uuid } from 'uuidv4';

export async function GET(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      console.log('No session found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User session:', session.user);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    console.log('Search params:', { startDate, endDate, status, customerId });

    // Get user's authorized companies
    const userCompanies = await taxDb
      .select({
        company_code: taxUserRoles.company_code
      })
      .from(taxUserRoles)
      .where(
        and(
          eq(taxUserRoles.idnik, session.user.username),
          eq(taxUserRoles.is_active, true)
        )
      );

    const companyCodes = userCompanies.map(c => c.company_code);
    console.log('User company codes:', companyCodes);

    if (companyCodes.length === 0) {
      console.log('No companies found for user');
      return NextResponse.json({ success: true, invoices: [] });
    }

    // Get company IDs based on codes
    const companies = await taxDb
      .select({
        id: taxMasterCompany.id
      })
      .from(taxMasterCompany)
      .where(inArray(taxMasterCompany.company_code, companyCodes));

    const companyIds = companies.map(c => c.id);
    console.log('Company IDs:', companyIds);

    // Build where conditions
    const whereConditions = [
      inArray(taxInvoiceHeader.company_id, companyIds)
    ];
    
    if (startDate && endDate) {
      whereConditions.push(
        between(taxInvoiceHeader.invoice_date, new Date(startDate), new Date(endDate))
      );
    }

    if (status && status !== 'ALL') {
      whereConditions.push(
        eq(taxInvoiceStatus.status, status)
      );
    }

    if (customerId && customerId !== 'ALL') {
      whereConditions.push(
        eq(taxInvoiceHeader.customer_id, customerId)
      );
    }

    console.log('Executing query with conditions:', whereConditions);

    // Fetch invoices with joins
    const invoices = await taxDb
      .select({
        id: taxInvoiceHeader.id,
        date: taxInvoiceHeader.invoice_date,
        number: taxInvoiceHeader.transaction_code,
        type: taxInvoiceHeader.invoice_type,
        customer: taxMasterCustomer.nama,
        npwp: taxMasterCustomer.npwp,
        company: taxMasterCompany.company_name,
        dpp: sql<string>`COALESCE(SUM(${taxInvoiceDetail.dpp}), 0)`.as('dpp'),
        ppn: sql<string>`COALESCE(SUM(${taxInvoiceDetail.ppn}), 0)`.as('ppn'),
        status: taxInvoiceStatus.status
      })
      .from(taxInvoiceHeader)
      .innerJoin(taxMasterCompany, eq(taxInvoiceHeader.company_id, taxMasterCompany.id))
      .innerJoin(taxMasterCustomer, eq(taxInvoiceHeader.customer_id, taxMasterCustomer.id))
      .leftJoin(taxInvoiceDetail, eq(taxInvoiceHeader.id, taxInvoiceDetail.invoice_id))
      .leftJoin(
        taxInvoiceStatus,
        and(
          eq(taxInvoiceHeader.id, taxInvoiceStatus.invoice_id),
          sql`${taxInvoiceStatus.created_at} = (
            SELECT MAX(created_at)
            FROM T_L_EFW_TAX_INVOICE_STATUS
            WHERE invoice_id = ${taxInvoiceHeader.id}
          )`
        )
      )
      .where(and(...whereConditions))
      .groupBy(
        taxInvoiceHeader.id,
        taxInvoiceHeader.invoice_date,
        taxInvoiceHeader.transaction_code,
        taxInvoiceHeader.invoice_type,
        taxMasterCustomer.nama,
        taxMasterCustomer.npwp,
        taxMasterCompany.company_name,
        taxInvoiceStatus.status
      )
      .orderBy(desc(taxInvoiceHeader.invoice_date));

    console.log('Query result:', invoices);

    return NextResponse.json({
      success: true,
      invoices
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { header, details } = body;
    
    if (!header || !details || !Array.isArray(details)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data structure' },
        { status: 400 }
      );
    }

    // Get company_id based on company_code
    const company = await taxDb
      .select()
      .from(taxMasterCompany)
      .where(eq(taxMasterCompany.company_code, header.company_code))
      .limit(1);

    if (!company || company.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalDPP = details.reduce((sum, detail) => sum + Number(detail.dpp), 0);
    const totalPPN = details.reduce((sum, detail) => sum + Number(detail.ppn), 0);

    const result = await taxDb.transaction(async (tx) => {
      // Insert Invoice Header
      await tx.insert(taxInvoiceHeader).values({
        id: header.id,
        customer_id: header.customer_id,
        company_id: company[0].id, // Use company_id from lookup
        transaction_type: header.transaction_type,
        invoice_date: new Date(header.invoice_date),
        invoice_type: header.invoice_type,
        transaction_code: header.transaction_code,
        buyer_doc_type: header.buyer_doc_type,
        buyer_country: header.buyer_country,
        buyer_doc_number: header.buyer_doc_number,
        buyer_email: header.buyer_email || '',
        created_by: header.created_by,
        created_at: new Date()
      });

      // Insert Invoice Details
      for (const detail of details) {
        await tx.insert(taxInvoiceDetail).values({
          id: detail.id,
          invoice_id: header.id,
          item_type: detail.item_type,
          goods_id: detail.goods_id || null,
          service_id: detail.service_id || null,
          item_name: detail.item_name.trim(),
          unit: detail.unit,
          unit_price: detail.unit_price,
          quantity: detail.quantity,
          total_price: detail.total_price,
          discount: detail.discount,
          down_payment: detail.down_payment,
          dpp: detail.dpp,
          dpp_other: detail.dpp_other,
          ppn_rate: detail.ppn_rate,
          ppn: detail.ppn,
          ppnbm_rate: detail.ppnbm_rate,
          ppnbm: detail.ppnbm,
          created_by: detail.created_by,
          created_at: new Date()
        });
      }

      // Insert Initial Status
      await tx.insert(taxInvoiceStatus).values({
        id: uuid(),
        invoice_id: header.id,
        status: 'DRAFT',
        created_by: header.created_by,
        created_at: new Date()
      });

      return {
        success: true,
        data: {
          id: header.id,
          transaction_code: header.transaction_code,
          totalDPP,
          totalPPN
        }
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error creating invoice:', error);
    const message = error instanceof Error ? error.message : 'Failed to create invoice';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}