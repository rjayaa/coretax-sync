// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxInvoiceHeader, taxInvoiceDetail, taxMasterCustomer } from '@/lib/db/schema/tax';
import { sql, eq, between, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Buat array untuk menyimpan semua kondisi where
    const whereConditions = [eq(taxInvoiceHeader.company_id, companyId)];

    if (startDate && endDate) {
      whereConditions.push(
        between(taxInvoiceHeader.invoice_date, new Date(startDate), new Date(endDate))
      );
    }

    if (status) {
      whereConditions.push(eq(taxInvoiceHeader.invoice_type, status));
    }

    if (customerId) {
      whereConditions.push(eq(taxInvoiceHeader.customer_id, customerId));
    }

    const invoices = await taxDb
      .select({
        id: taxInvoiceHeader.id,
        date: taxInvoiceHeader.invoice_date,
        number: taxInvoiceHeader.reference,
        customer: taxMasterCustomer.nama,
        npwp: taxMasterCustomer.npwp,
        type: taxInvoiceDetail.item_type,
        dpp: taxInvoiceDetail.dpp,
        ppn: taxInvoiceDetail.ppn,
        status: taxInvoiceHeader.invoice_type,
      })
      .from(taxInvoiceHeader)
      .leftJoin(
        taxMasterCustomer,
        eq(taxInvoiceHeader.customer_id, taxMasterCustomer.id)
      )
      .leftJoin(
        taxInvoiceDetail,
        eq(taxInvoiceHeader.id, taxInvoiceDetail.invoice_id)
      )
      .where(and(...whereConditions));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { header, details } = body;

    // Validate required data
    if (!header || !details || !Array.isArray(details)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    await taxDb.transaction(async (tx) => {
      // Insert header
      await tx.insert(taxInvoiceHeader)
        .values({
          id: header.id,
          customer_id: header.customer_id,
          company_id: header.company_id,
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

      // Insert details
      const detailsToInsert = details.map(detail => ({
        id: detail.id,
        invoice_id: header.id,
        item_type: detail.item_type,
        goods_id: detail.goods_id,
        service_id: detail.service_id,
        item_name: detail.item_name,
        unit: detail.unit,
        unit_price: detail.unit_price,
        quantity: detail.quantity,
        total_price: detail.total_price,
        discount: detail.discount || 0,
        down_payment: detail.down_payment || 0,
        dpp: detail.dpp,
        dpp_other: detail.dpp_other || 0,
        ppn_rate: detail.ppn_rate,
        ppn: detail.ppn,
        ppnbm_rate: detail.ppnbm_rate || 0,
        ppnbm: detail.ppnbm || 0,
        created_by: header.created_by,
        created_at: new Date()
      }));

      await tx.insert(taxInvoiceDetail)
        .values(detailsToInsert);
    });

    // Fetch the inserted invoice for confirmation
    const insertedInvoice = await taxDb
      .select()
      .from(taxInvoiceHeader)
      .where(eq(taxInvoiceHeader.id, header.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      data: {
        id: header.id,
        transaction_code: header.transaction_code
      }
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Check for specific error types and provide better error messages
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: 'Invalid reference to customer or company' },
          { status: 400 }
        );
      }
      
      // Check for duplicate entry
      if (error.message.includes('Duplicate entry')) {
        return NextResponse.json(
          { error: 'Invoice with this ID already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}