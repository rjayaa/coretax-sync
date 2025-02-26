// src/app/api/detail-faktur/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { faktur } from '@/lib/db/schema/faktur';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get faktur ID from query params
    const { searchParams } = new URL(request.url);
    const fakturId = searchParams.get('fakturId');
    
    console.log("GET - Fetching details for fakturId:", fakturId);
    
    if (!fakturId) {
      return NextResponse.json(
        { error: 'Missing fakturId parameter' },
        { status: 400 }
      );
    }
    
    // Query detail records for this faktur
    const details = await taxDb
      .select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId))
      .execute();
    
    console.log(`Found ${details.length} detail records for faktur ${fakturId}`);
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error in detail-faktur GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch detail faktur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received detail faktur data:', body);

    // Validasi data yang masuk
    if (!body.id_detail_faktur || !body.id_faktur || !body.nama_satuan_ukur) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // IMPORTANT: Verifikasi bahwa faktur dengan ID tersebut ada di database
    const fakturExists = await taxDb
      .select({ id: faktur.id })
      .from(faktur)
      .where(eq(faktur.id, body.id_faktur))
      .execute();
    
    console.log(`Verifying faktur ID ${body.id_faktur} exists:`, fakturExists);
    
    if (!fakturExists || fakturExists.length === 0) {
      console.error(`Faktur with ID ${body.id_faktur} not found in database`);
      return NextResponse.json(
        { 
          error: 'Faktur dengan ID tersebut tidak ditemukan', 
          details: `ID faktur '${body.id_faktur}' tidak ada dalam database`
        },
        { status: 404 }
      );
    }

    // Periksa data numerik untuk memastikan tidak ada NaN atau nilai tidak valid
    const safeNumericValue = (value: any, defaultValue = 0) => {
      if (value === null || value === undefined) return defaultValue;
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Buat record yang akan diinsert dengan handling nilai yang lebih baik
    const detailData = {
      id_detail_faktur: body.id_detail_faktur,
      id_faktur: body.id_faktur,
      barang_or_jasa: body.barang_or_jasa,
      kode_barang_or_jasa: body.kode_barang_or_jasa || null,
      nama_barang_or_jasa: body.nama_barang_or_jasa || null,
      nama_satuan_ukur: body.nama_satuan_ukur,
      harga_satuan: safeNumericValue(body.harga_satuan),
      jumlah_barang: body.jumlah_barang !== undefined ? safeNumericValue(body.jumlah_barang, 1) : null,
      jumlah_jasa: body.jumlah_jasa !== undefined ? safeNumericValue(body.jumlah_jasa, 1) : null,
      diskon_persen: safeNumericValue(body.diskon_persen, 0),
      dpp: safeNumericValue(body.dpp),
      dpp_nilai_lain: safeNumericValue(body.dpp_nilai_lain),
      tarif_ppn: safeNumericValue(body.tarif_ppn, 12),
      ppn: safeNumericValue(body.ppn),
      tarif_ppnbm: body.tarif_ppnbm !== undefined ? safeNumericValue(body.tarif_ppnbm, 0) : null,
      ppnbm: body.ppnbm !== undefined ? safeNumericValue(body.ppnbm, 0) : null,
    };

    console.log('Processed detail data for insert:', detailData);

    try {
      const result = await taxDb.insert(fakturDetail).values(detailData);
      console.log('Insert result:', result);
      return NextResponse.json(detailData);
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { 
          error: 'Database insert error', 
          details: insertError.message || 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in detail-faktur POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create detail faktur' },
      { status: 500 }
    );
  }
}