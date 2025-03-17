// src/app/api/detail-faktur/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';

// Fungsi untuk mengkonversi nilai menjadi desimal yang aman
const safeDecimal = (value: any, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? defaultValue : numValue;
};

// Fungsi untuk mengkonversi nilai menjadi integer yang aman
const safeInteger = (value: any, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  return isNaN(numValue) ? defaultValue : numValue;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    
    // Get the faktur data
    const fakturData = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
    
    if (fakturData.length === 0) {
      return NextResponse.json(
        { error: 'Faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Get all detail items for this faktur
    const detailItems = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId));
    
    // Format date for response
    const formattedFaktur = {
      ...fakturData[0],
      tanggal_faktur: fakturData[0].tanggal_faktur instanceof Date
        ? fakturData[0].tanggal_faktur.toISOString().split('T')[0]
        : fakturData[0].tanggal_faktur,
    };
    
    // Return faktur with its details
    return NextResponse.json({
      faktur: formattedFaktur,
      details: detailItems
    });
  } catch (error: any) {
    console.error('Error fetching faktur with details:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil faktur dengan detail' },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const detailId = params.id;
    const data = await req.json();
    
    // Validasi: cek apakah detail faktur ada
    const existingDetail = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, detailId))
      .limit(1);
      
    if (existingDetail.length === 0) {
      return NextResponse.json(
        { error: 'Detail faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Persiapkan data untuk update
    const updateData: any = {};
    
    // Update field yang diberikan
    if (data.barang_or_jasa !== undefined) updateData.barang_or_jasa = data.barang_or_jasa;
    if (data.kode_barang_or_jasa !== undefined) updateData.kode_barang_or_jasa = data.kode_barang_or_jasa;
    if (data.nama_barang_or_jasa !== undefined) updateData.nama_barang_or_jasa = data.nama_barang_or_jasa;
    if (data.nama_satuan_ukur !== undefined) updateData.nama_satuan_ukur = data.nama_satuan_ukur;
    if (data.harga_satuan !== undefined) updateData.harga_satuan = safeDecimal(data.harga_satuan);
    if (data.dpp !== undefined) updateData.dpp = safeDecimal(data.dpp);
    if (data.dpp_nilai_lain !== undefined) updateData.dpp_nilai_lain = safeDecimal(data.dpp_nilai_lain);
    if (data.ppn !== undefined) updateData.ppn = safeDecimal(data.ppn);
    if (data.tarif_ppn !== undefined) updateData.tarif_ppn = safeDecimal(data.tarif_ppn, 12);
    if (data.tarif_ppnbm !== undefined) updateData.tarif_ppnbm = safeDecimal(data.tarif_ppnbm, 0);
    if (data.ppnbm !== undefined) updateData.ppnbm = safeDecimal(data.ppnbm, 0);
    if (data.diskon_persen !== undefined) updateData.diskon_persen = safeDecimal(data.diskon_persen, 0);
    
    // Handle update jumlah barang/jasa
    if (data.jumlah_barang !== undefined && data.barang_or_jasa === 'a') {
      updateData.jumlah_barang = safeInteger(data.jumlah_barang, 1);
    }
    
    if (data.jumlah_jasa !== undefined && data.barang_or_jasa === 'b') {
      updateData.jumlah_jasa = safeInteger(data.jumlah_jasa, 1);
    }
    
    if (data.jumlah_barang_jasa !== undefined) {
      if (data.barang_or_jasa === 'a' || existingDetail[0].barang_or_jasa === 'a') {
        updateData.jumlah_barang = safeInteger(data.jumlah_barang_jasa, 1);
      } else if (data.barang_or_jasa === 'b' || existingDetail[0].barang_or_jasa === 'b') {
        updateData.jumlah_jasa = safeInteger(data.jumlah_barang_jasa, 1);
      }
    }
    
    // Jika tidak ada data yang diubah
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }
    
    // Update data di database
    await db.update(fakturDetail)
      .set(updateData)
      .where(eq(fakturDetail.id_detail_faktur, detailId));
    
    // Ambil detail yang sudah diupdate untuk response
    const updatedDetail = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, detailId))
      .limit(1);
    
    return NextResponse.json(updatedDetail[0]);
  } catch (error: any) {
    console.error('Error updating detail faktur:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate detail faktur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const detailId = params.id;
    
    // Validasi: cek apakah detail faktur ada
    const existingDetail = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, detailId))
      .limit(1);
      
    if (existingDetail.length === 0) {
      return NextResponse.json(
        { error: 'Detail faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Hapus detail faktur
    await db.delete(fakturDetail)
      .where(eq(fakturDetail.id_detail_faktur, detailId));
    
    return NextResponse.json(
      { message: 'Detail faktur berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting detail faktur:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus detail faktur' },
      { status: 500 }
    );
  }
}