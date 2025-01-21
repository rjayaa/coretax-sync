import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('API Route: GET /api/customers called');
  
  try {
    const customers = await prisma.t_L_EFW_TAX_MASTER_CUSTOMER.findMany({
      select: {
        id: true,
        nama: true,
        npwp: true,
        jalan: true,
        blok: true,
        nomor: true,
        rt: true,
        rw: true,
        kecamatan: true,
        kelurahan: true,
        kabupaten: true,
        propinsi: true,
      }
    });

    console.log(`Found ${customers.length} customers`);

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      nama: customer.nama,
      npwp: customer.npwp,
      alamatLengkap: [
        customer.jalan,
        customer.blok,
        customer.nomor,
        customer.rt ? `RT ${customer.rt}` : null,
        customer.rw ? `RW ${customer.rw}` : null,
        customer.kelurahan,
        customer.kecamatan,
        customer.kabupaten,
        customer.propinsi
      ].filter(Boolean).join(', ')
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