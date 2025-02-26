// src/app/api/faktur/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Penggunaan params yang benar, pastikan mengaksesnya dari params
    const id = params.id;
    
    // Fetch faktur data
    const fakturData = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, id))
      .execute();

    if (!fakturData || fakturData.length === 0) {
      return NextResponse.json(
        { error: 'Faktur not found' },
        { status: 404 }
      );
    }

    // Fetch detail data
    const detailData = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, id))
      .execute();

    return NextResponse.json({
      faktur: fakturData[0],
      details: detailData
    });
  } catch (error) {
    console.error('Error in faktur GET by ID:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch faktur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Validate faktur exists
    const existingFaktur = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, id))
      .execute();

    if (!existingFaktur || existingFaktur.length === 0) {
      return NextResponse.json(
        { error: 'Faktur not found' },
        { status: 404 }
      );
    }

    // Update faktur
    await taxDb
      .update(faktur)
      .set({
        // Tambahkan properti yang ingin diupdate
        npwp_penjual: body.npwp_penjual,
        tanggal_faktur: body.tanggal_faktur ? new Date(body.tanggal_faktur) : undefined,
        jenis_faktur: body.jenis_faktur,
        kode_transaksi: body.kode_transaksi,
        keterangan_tambahan: body.keterangan_tambahan,
        dokumen_pendukung: body.dokumen_pendukung,
        referensi: body.referensi,
        cap_fasilitas: body.cap_fasilitas,
        id_tku_penjual: body.id_tku_penjual,
        npwp_nik_pembeli: body.npwp_nik_pembeli,
        jenis_id_pembeli: body.jenis_id_pembeli,
        negara_pembeli: body.negara_pembeli,
        nomor_dokumen_pembeli: body.nomor_dokumen_pembeli,
        nama_pembeli: body.nama_pembeli,
        alamat_pembeli: body.alamat_pembeli,
      })
      .where(eq(faktur.id, id))
      .execute();

    // Fetch updated data
    const updatedFaktur = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, id))
      .execute();

    return NextResponse.json(updatedFaktur[0]);
  } catch (error) {
    console.error('Error in faktur PATCH:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update faktur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate faktur exists
    const existingFaktur = await taxDb
      .select()
      .from(faktur)
      .where(eq(faktur.id, id))
      .execute();

    if (!existingFaktur || existingFaktur.length === 0) {
      return NextResponse.json(
        { error: 'Faktur not found' },
        { status: 404 }
      );
    }

    // Delete related detail records first to maintain referential integrity
    await taxDb
      .delete(fakturDetail)
      .where(eq(fakturDetail.id_faktur, id))
      .execute();

    // Delete the faktur
    await taxDb
      .delete(faktur)
      .where(eq(faktur.id, id))
      .execute();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in faktur DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete faktur' },
      { status: 500 }
    );
  }
}