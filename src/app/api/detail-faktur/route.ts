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
    console.log('Received detail faktur data:', JSON.stringify(data, null, 2));
    
    // Validasi data yang diperlukan dengan pesan error spesifik
    if (!data.id_faktur) {
      return NextResponse.json({ error: 'ID Faktur tidak boleh kosong' }, { status: 400 });
    }
    
    if (!data.nama_satuan_ukur) {
      return NextResponse.json({ error: 'Nama Satuan Ukur tidak boleh kosong' }, { status: 400 });
    }
    
    // Additional required field validation
    if (!data.barang_or_jasa) {
      return NextResponse.json({ error: 'Tipe Barang/Jasa harus dipilih' }, { status: 400 });
    }
    
    if (!data.nama_barang_or_jasa) {
      return NextResponse.json({ error: 'Nama Barang/Jasa tidak boleh kosong' }, { status: 400 });
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
    
    // Better numeric value handling with clear logs
    console.log('Processing numeric fields for detail faktur');
    const hargaSatuan = safeDecimal(data.harga_satuan);
    console.log('Harga Satuan:', data.harga_satuan, '->', hargaSatuan);
    
    const jumlahBarang = data.barang_or_jasa === 'a' ? safeInteger(data.jumlah_barang || data.jumlah_barang_jasa, 1) : null;
    console.log('Jumlah Barang:', data.jumlah_barang || data.jumlah_barang_jasa, '->', jumlahBarang);
    
    const jumlahJasa = data.barang_or_jasa === 'b' ? safeInteger(data.jumlah_jasa || data.jumlah_barang_jasa, 1) : null;
    console.log('Jumlah Jasa:', data.jumlah_jasa || data.jumlah_barang_jasa, '->', jumlahJasa);
    
    const diskonPersen = safeDecimal(data.diskon_persen || data.total_diskon, 0);
    console.log('Diskon Persen:', data.diskon_persen || data.total_diskon, '->', diskonPersen);
    
    const dpp = safeDecimal(data.dpp);
    console.log('DPP:', data.dpp, '->', dpp);
    
    const dppNilaiLain = safeDecimal(data.dpp_nilai_lain, 0);
    console.log('DPP Nilai Lain:', data.dpp_nilai_lain, '->', dppNilaiLain);
    
    const tarifPpn = safeDecimal(data.tarif_ppn, 12);
    console.log('Tarif PPN:', data.tarif_ppn, '->', tarifPpn);
    
    const ppn = safeDecimal(data.ppn);
    console.log('PPN:', data.ppn, '->', ppn);
    
    const tarifPpnbm = safeDecimal(data.tarif_ppnbm, 0);
    console.log('Tarif PPnBM:', data.tarif_ppnbm, '->', tarifPpnbm);
    
    const ppnbm = safeDecimal(data.ppnbm, 0);
    console.log('PPnBM:', data.ppnbm, '->', ppnbm);
    
    // Persiapkan data untuk dimasukkan ke database
    const detailData = {
      id_detail_faktur: detailId,
      id_faktur: data.id_faktur,
      barang_or_jasa: data.barang_or_jasa,
      kode_barang_or_jasa: data.kode_barang_or_jasa || null,
      nama_barang_or_jasa: data.nama_barang_or_jasa,
      nama_satuan_ukur: data.nama_satuan_ukur,
      harga_satuan: hargaSatuan,
      jumlah_barang: jumlahBarang,
      jumlah_jasa: jumlahJasa,
      diskon_persen: diskonPersen,
      dpp: dpp,
      dpp_nilai_lain: dppNilaiLain,
      tarif_ppn: tarifPpn,
      ppn: ppn,
      tarif_ppnbm: tarifPpnbm,
      ppnbm: ppnbm,
    };
    
    console.log('Inserting detail faktur:', JSON.stringify(detailData, null, 2));
    
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