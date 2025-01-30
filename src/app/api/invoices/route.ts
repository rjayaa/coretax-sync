// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { 
  taxInvoiceHeader, 
  taxInvoiceDetail, 
  taxInvoiceStatus,  // Add this import
  taxMasterCustomer,
  taxMasterCompany 
} from '@/lib/db/schema/tax';
import { eq, and, sql, between } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

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
        id: uuidv4(),
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