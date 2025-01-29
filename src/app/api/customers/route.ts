// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxMasterCustomer } from '@/lib/db/schema/tax';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const customers = await taxDb
      .select({
        id: taxMasterCustomer.id,
        nama: taxMasterCustomer.nama,
        npwp: taxMasterCustomer.npwp,
        jalan: taxMasterCustomer.jalan,
        alamatLengkap: taxDb.sql`CONCAT(
          COALESCE(${taxMasterCustomer.jalan}, ''), ' ',
          COALESCE(${taxMasterCustomer.blok}, ''), ' ',
          COALESCE(${taxMasterCustomer.nomor}, ''), ' RT.',
          COALESCE(${taxMasterCustomer.rt}, ''), ' RW.',
          COALESCE(${taxMasterCustomer.rw}, ''), ' ',
          COALESCE(${taxMasterCustomer.kelurahan}, ''), ' ',
          COALESCE(${taxMasterCustomer.kecamatan}, ''), ' ',
          COALESCE(${taxMasterCustomer.kabupaten}, ''), ' ',
          COALESCE(${taxMasterCustomer.propinsi}, ''), ' ',
          COALESCE(${taxMasterCustomer.kode_pos}, '')
        )`
      })
      .from(taxMasterCustomer)
      .where(eq(taxMasterCustomer.npwp, taxDb.sql`npwp IS NOT NULL`));

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}