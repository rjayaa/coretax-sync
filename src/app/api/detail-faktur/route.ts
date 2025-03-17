// src/app/api/detail-faktur/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { faktur } from '@/lib/db/schema/faktur';
import { v4 as uuidv4 } from 'uuid';
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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fakturId = url.searchParams.get('fakturId');
    
    if (!fakturId) {
      return NextResponse.json(
        { error: 'ID faktur diperlukan' },
        { status: 400 }
      );
    }
    
    // Cek apakah faktur ada
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
    
    // Ambil semua detail untuk faktur tersebut
    const details = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId));
      
    return NextResponse.json(details);
  } catch (error: any) {
    console.error('Error fetching faktur details:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil detail faktur' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validasi data yang diperlukan
    if (!data.id_faktur || !data.nama_satuan_ukur) {
      return NextResponse.json(
        { error: 'Data detail faktur tidak lengkap' },
        { status: 400 }
      );
    }
    
    // Cek apakah faktur ada
    const fakturData = await db.select()
      .from(faktur)
      .where(eq(faktur.id, data.id_faktur))
      .limit(1);
      
    if (fakturData.length === 0) {
      return NextResponse.json(
        { error: 'Faktur induk tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Generate UUID untuk detail faktur baru jika tidak ada
    const detailId = data.id_detail_faktur || uuidv4();
    
    // Persiapkan data untuk dimasukkan ke database
    const detailData = {
      id_detail_faktur: detailId,
      id_faktur: data.id_faktur,
      barang_or_jasa: data.barang_or_jasa || null,
      kode_barang_or_jasa: data.kode_barang_or_jasa || null,
      nama_barang_or_jasa: data.nama_barang_or_jasa || null,
      nama_satuan_ukur: data.nama_satuan_ukur,
      harga_satuan: safeDecimal(data.harga_satuan),
      // Handling jumlah barang/jasa
      jumlah_barang: data.barang_or_jasa === 'a' ? 
        safeInteger(data.jumlah_barang, 1) : null,
      jumlah_jasa: data.barang_or_jasa === 'b' ? 
        safeInteger(data.jumlah_jasa, 1) : null,
      diskon_persen: safeDecimal(data.diskon_persen, 0),
      dpp: safeDecimal(data.dpp),
      dpp_nilai_lain: safeDecimal(data.dpp_nilai_lain),
      tarif_ppn: safeDecimal(data.tarif_ppn, 12),
      ppn: safeDecimal(data.ppn),
      tarif_ppnbm: safeDecimal(data.tarif_ppnbm, 0),
      ppnbm: safeDecimal(data.ppnbm, 0),
    };
    
    // Insert data ke database
    await db.insert(fakturDetail).values(detailData);
    
    return NextResponse.json(detailData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating faktur detail:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat detail faktur' },
      { status: 500 }
    );
  }
}