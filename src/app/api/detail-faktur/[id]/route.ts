//src/app/api/detail-faktur/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';
// src/app/api/detail-faktur/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Validasi ID
    if (!id) {
      return NextResponse.json(
        { error: 'Missing detail faktur ID' },
        { status: 400 }
      );
    }

    // Periksa bahwa record ada
    const existingDetail = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, id))
      .execute();

    if (!existingDetail || existingDetail.length === 0) {
      return NextResponse.json(
        { error: 'Detail faktur not found' },
        { status: 404 }
      );
    }

    // Periksa data numerik untuk memastikan tidak ada NaN
    const safeNumericValue = (value: any, defaultValue = 0) => {
      if (value === null || value === undefined) return defaultValue;
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Siapkan data untuk update, hanya field yang ada di body
    const updateData: any = {};
    
    if (body.kode_barang_or_jasa !== undefined) updateData.kode_barang_or_jasa = body.kode_barang_or_jasa;
    if (body.nama_barang_or_jasa !== undefined) updateData.nama_barang_or_jasa = body.nama_barang_or_jasa;
    if (body.nama_satuan_ukur !== undefined) updateData.nama_satuan_ukur = body.nama_satuan_ukur;
    if (body.harga_satuan !== undefined) updateData.harga_satuan = safeNumericValue(body.harga_satuan);
    if (body.jumlah_barang !== undefined) updateData.jumlah_barang = safeNumericValue(body.jumlah_barang, 1);
    if (body.jumlah_jasa !== undefined) updateData.jumlah_jasa = safeNumericValue(body.jumlah_jasa, 1);
    if (body.diskon_persen !== undefined) updateData.diskon_persen = safeNumericValue(body.diskon_persen, 0);
    if (body.dpp !== undefined) updateData.dpp = safeNumericValue(body.dpp);
    if (body.dpp_nilai_lain !== undefined) updateData.dpp_nilai_lain = safeNumericValue(body.dpp_nilai_lain);
    if (body.tarif_ppn !== undefined) updateData.tarif_ppn = safeNumericValue(body.tarif_ppn, 12);
    if (body.ppn !== undefined) updateData.ppn = safeNumericValue(body.ppn);
    if (body.tarif_ppnbm !== undefined) updateData.tarif_ppnbm = safeNumericValue(body.tarif_ppnbm, 0);
    if (body.ppnbm !== undefined) updateData.ppnbm = safeNumericValue(body.ppnbm, 0);

    // Update record
    await taxDb
      .update(fakturDetail)
      .set(updateData)
      .where(eq(fakturDetail.id_detail_faktur, id))
      .execute();

    // Get updated record
    const updatedDetail = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, id))
      .execute();

    return NextResponse.json(updatedDetail[0]);
  } catch (error) {
    console.error('Error in detail-faktur PATCH:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update detail faktur' },
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

    // Validasi ID
    if (!id) {
      return NextResponse.json(
        { error: 'Missing detail faktur ID' },
        { status: 400 }
      );
    }

    // Periksa bahwa record ada
    const existingDetail = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, id))
      .execute();

    if (!existingDetail || existingDetail.length === 0) {
      return NextResponse.json(
        { error: 'Detail faktur not found' },
        { status: 404 }
      );
    }

    // Delete record
    await taxDb
      .delete(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, id))
      .execute();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in detail-faktur DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete detail faktur' },
      { status: 500 }
    );
  }
}