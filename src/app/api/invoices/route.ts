// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { 
  taxInvoiceHeader, 
  taxInvoiceDetail,
  taxMasterCustomer 
} from '@/lib/db/schema/tax';
import { and, between, eq } from 'drizzle-orm';

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

    let query = taxDb
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
      .leftJoin(taxMasterCustomer, eq(taxInvoiceHeader.customer_id, taxMasterCustomer.id))
      .leftJoin(taxInvoiceDetail, eq(taxInvoiceHeader.id, taxInvoiceDetail.invoice_id))
      .where(eq(taxInvoiceHeader.company_id, companyId));

    if (startDate && endDate) {
      query = query.where(
        between(taxInvoiceHeader.invoice_date, new Date(startDate), new Date(endDate))
      );
    }

    if (status) {
      query = query.where(eq(taxInvoiceHeader.invoice_type, status));
    }

    if (customerId) {
      query = query.where(eq(taxInvoiceHeader.customer_id, customerId));
    }

    const invoices = await query;

    return NextResponse.json({ invoices });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}