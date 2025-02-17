// app/api/faktur/[id]/route.ts
import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';
// app/api/faktur/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch faktur data - menggunakan id bukan id_faktur
    const fakturData = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, params.id))
      .execute();

    if (!fakturData || fakturData.length === 0) {
      return NextResponse.json(
        { error: 'Faktur not found' },
        { status: 404 }
      );
    }

    // Fetch detail faktur data - menggunakan id_faktur sesuai foreign key
    const detailsData = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, params.id))
      .execute();

    return NextResponse.json({
      faktur: fakturData[0],
      details: detailsData
    });
  } catch (error) {
    console.error('Error in faktur GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch faktur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tanggal_faktur || !body.kode_transaksi || 
        !body.id_tku_penjual || !body.npwp_nik_pembeli || 
        !body.nama_pembeli || !body.alamat_pembeli) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await taxDb
      .update(faktur)
      .set({
        tanggal_faktur: new Date(body.tanggal_faktur),
        jenis_faktur: body.jenis_faktur || 'Normal',
        kode_transaksi: body.kode_transaksi,
        keterangan_tambahan: body.keterangan_tambahan || null,
        dokumen_pendukung: body.dokumen_pendukung || null,
        referensi: body.referensi || null,
        cap_fasilitas: body.cap_fasilitas || null,
        id_tku_penjual: body.id_tku_penjual,
        npwp_nik_pembeli: body.npwp_nik_pembeli,
        jenis_id_pembeli: body.jenis_id_pembeli || 'TIN',
        negara_pembeli: body.negara_pembeli || 'IDN',
        nomor_dokumen_pembeli: body.nomor_dokumen_pembeli || null,
        nama_pembeli: body.nama_pembeli,
        alamat_pembeli: body.alamat_pembeli,
      })
      .where(eq(faktur.id, params.id))
      .execute();

    // Fetch updated data
    const updatedFaktur = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, params.id))
      .execute();

    return NextResponse.json(updatedFaktur[0]);
  } catch (error) {
    console.error('Error in faktur PUT:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update faktur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all related detail records
    await taxDb
      .delete(fakturDetail)
      .where(eq(fakturDetail.id_faktur, params.id))
      .execute();

    // Then delete the main faktur
    await taxDb
      .delete(faktur)
      .where(eq(faktur.id, params.id))
      .execute();

    return NextResponse.json({ message: 'Faktur deleted successfully' });
  } catch (error) {
    console.error('Error in faktur DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete faktur' },
      { status: 500 }
    );
  }
}