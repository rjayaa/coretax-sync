import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { taxMasterCustomer } from '@/lib/db/schema/master';
import { desc, eq, between, and } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    // Build base query with joins
    let query = taxDb
      .select({
        id: faktur.id,
        tanggalFaktur: faktur.tanggalFaktur,
        nomorFaktur: faktur.nomorFaktur,
        customerNama: taxMasterCustomer.nama,
        customerNpwp: taxMasterCustomer.npwp,
        jenisFaktur: faktur.jenisFaktur,
        dppTotal: faktur.dppTotal,
        ppnTotal: faktur.ppnTotal,
        status: faktur.status,
      })
      .from(faktur)
      .leftJoin(taxMasterCustomer, eq(faktur.npwpPembeli, taxMasterCustomer.npwp));

    // Apply filters
    const conditions = [];

    if (startDate && endDate) {
      conditions.push(between(faktur.tanggalFaktur, new Date(startDate), new Date(endDate)));
    }

    if (status && status !== 'ALL') {
      conditions.push(eq(faktur.status, status));
    }

    if (customerId && customerId !== 'ALL') {
      conditions.push(eq(taxMasterCustomer.id, customerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute query
    const invoices = await query.orderBy(desc(faktur.tanggalFaktur));

    return NextResponse.json({
      success: true,
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        date: invoice.tanggalFaktur,
        number: invoice.nomorFaktur,
        customer: invoice.customerNama,
        npwp: invoice.customerNpwp,
        type: invoice.jenisFaktur,
        dpp: invoice.dppTotal,
        ppn: invoice.ppnTotal,
        status: invoice.status,
      }))
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
