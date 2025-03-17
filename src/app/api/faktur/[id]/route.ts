// src/app/api/faktur/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    const result = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error fetching faktur:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    const data = await req.json();
    
    // Validasi: cek apakah faktur ada
    const existingFaktur = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
      
    if (existingFaktur.length === 0) {
      return NextResponse.json(
        { error: 'Faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Persiapkan data untuk update
    const updateData: any = {};
    
    // Update hanya field yang diberikan
    if (data.npwp_penjual !== undefined) updateData.npwp_penjual = data.npwp_penjual;
    if (data.tanggal_faktur !== undefined) updateData.tanggal_faktur = new Date(data.tanggal_faktur);
    if (data.jenis_faktur !== undefined) updateData.jenis_faktur = data.jenis_faktur;
    if (data.kode_transaksi !== undefined) updateData.kode_transaksi = data.kode_transaksi;
    if (data.keterangan_tambahan !== undefined) updateData.keterangan_tambahan = data.keterangan_tambahan;
    if (data.dokumen_pendukung !== undefined) updateData.dokumen_pendukung = data.dokumen_pendukung;
    if (data.referensi !== undefined) updateData.referensi = data.referensi;
    if (data.cap_fasilitas !== undefined) updateData.cap_fasilitas = data.cap_fasilitas;
    if (data.id_tku_penjual !== undefined) updateData.id_tku_penjual = data.id_tku_penjual;
    if (data.npwp_nik_pembeli !== undefined) updateData.npwp_nik_pembeli = data.npwp_nik_pembeli;
    if (data.jenis_id_pembeli !== undefined) updateData.jenis_id_pembeli = data.jenis_id_pembeli;
    if (data.negara_pembeli !== undefined) updateData.negara_pembeli = data.negara_pembeli;
    if (data.nomor_dokumen_pembeli !== undefined) updateData.nomor_dokumen_pembeli = data.nomor_dokumen_pembeli;
    if (data.nama_pembeli !== undefined) updateData.nama_pembeli = data.nama_pembeli;
    if (data.alamat_pembeli !== undefined) updateData.alamat_pembeli = data.alamat_pembeli;
    if (data.id_tku_pembeli !== undefined) updateData.id_tku_pembeli = data.id_tku_pembeli;
    if (data.nomor_faktur_pajak !== undefined) updateData.nomor_faktur_pajak = data.nomor_faktur_pajak;
    if (data.status_faktur !== undefined) updateData.status_faktur = data.status_faktur;
    if (data.tipe_transaksi !== undefined) updateData.tipe_transaksi = data.tipe_transaksi;
    
    // Jika tidak ada data yang diubah
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diubah' },
        { status: 400 }
      );
    }
    
    // Update data di database
    await db.update(faktur)
      .set(updateData)
      .where(eq(faktur.id, fakturId));
    
    // Ambil faktur yang sudah diupdate untuk response
    const updatedFaktur = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
    
    // Format tanggal untuk respons
    const responseData = {
      ...updatedFaktur[0],
      tanggal_faktur: updatedFaktur[0].tanggal_faktur instanceof Date 
        ? updatedFaktur[0].tanggal_faktur.toISOString().split('T')[0]
        : updatedFaktur[0].tanggal_faktur,
    };
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error updating faktur:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate faktur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    
    // Validasi: cek apakah faktur ada
    const existingFaktur = await db.select()
      .from(faktur)
      .where(eq(faktur.id, fakturId))
      .limit(1);
      
    if (existingFaktur.length === 0) {
      return NextResponse.json(
        { error: 'Faktur tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Hapus semua detail faktur terlebih dahulu (untuk menjaga integritas referensial)
    await db.delete(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId));
    
    // Hapus faktur
    await db.delete(faktur)
      .where(eq(faktur.id, fakturId));
    
    return NextResponse.json(
      { message: 'Faktur berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting faktur:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus faktur' },
      { status: 500 }
    );
  }
}