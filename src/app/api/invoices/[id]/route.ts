import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { detailFaktur } from '@/lib/db/schema/detail-faktur';
import { taxMasterCustomer } from '@/lib/db/schema/master';
import { eq } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch faktur with customer data
    const invoice = await taxDb
      .select({
        faktur: {
          id: faktur.id,
          nomorFaktur: faktur.nomorFaktur,
          tanggalFaktur: faktur.tanggalFaktur,
          jenisFaktur: faktur.jenisFaktur,
          kodeTransaksi: faktur.kodeTransaksi,
          nomorInvoice: faktur.nomorInvoice,
          npwpPembeli: faktur.npwpPembeli,
          namaPembeli: faktur.namaPembeli,
          alamatPembeli: faktur.alamatPembeli,
          dppTotal: faktur.dppTotal,
          ppnTotal: faktur.ppnTotal,
          ppnbmTotal: faktur.ppnbmTotal,
          status: faktur.status,
        },
        customer: {
          nama: taxMasterCustomer.nama,
          npwp: taxMasterCustomer.npwp,
          alamat: taxMasterCustomer.jalan,
        },
      })
      .from(faktur)
      .leftJoin(taxMasterCustomer, eq(faktur.npwpPembeli, taxMasterCustomer.npwp))
      .where(eq(faktur.id, params.id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Fetch detail items
    const details = await taxDb
      .select()
      .from(detailFaktur)
      .where(eq(detailFaktur.fakturId, params.id))
      .orderBy(detailFaktur.nomorUrut);

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        details
      }
    });

  } catch (error) {
    console.error('Error fetching invoice detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice detail' },
      { status: 500 }
    );
  }
}