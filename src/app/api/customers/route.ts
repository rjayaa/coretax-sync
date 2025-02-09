// src/app/api/customers/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { taxMasterCustomer } from '@/lib/db/index';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const customers = await taxDb
      .select({
        id: taxMasterCustomer.id,
        nama: taxMasterCustomer.nama,
        npwp: taxMasterCustomer.npwp,
        jalan: taxMasterCustomer.jalan,
        blok: taxMasterCustomer.blok,
        nomor: taxMasterCustomer.nomor,
        rt: taxMasterCustomer.rt,
        rw: taxMasterCustomer.rw,
        kelurahan: taxMasterCustomer.kelurahan,
        kecamatan: taxMasterCustomer.kecamatan,
        kabupaten: taxMasterCustomer.kabupaten,
        propinsi: taxMasterCustomer.propinsi,
        kode_pos: taxMasterCustomer.kode_pos
      })
      .from(taxMasterCustomer)
      .where(sql`${taxMasterCustomer.npwp} IS NOT NULL`);

    // Transform data to include formatted address
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      nama: customer.nama,
      npwp: customer.npwp,
      jalan: customer.jalan,
      // Format alamat lengkap di sini
      alamatLengkap: [
        customer.jalan,
        customer.blok,
        customer.nomor,
        customer.rt ? `RT.${customer.rt}` : '',
        customer.rw ? `RW.${customer.rw}` : '',
        customer.kelurahan,
        customer.kecamatan,
        customer.kabupaten,
        customer.propinsi,
        customer.kode_pos
      ].filter(Boolean).join(' ')
    }));

    return NextResponse.json({ customers: formattedCustomers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}