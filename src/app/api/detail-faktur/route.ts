import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received detail faktur data:', body); // Debug log

    // Transform the data to match database schema
    const detailData = {
      id_detail_faktur: body.id_detail_faktur || uuidv4(),
      id_faktur: body.id_faktur,
      barang_or_jasa: body.barang_or_jasa,
      kode_barang_or_jasa: body.kode_barang_jasa || null,
      nama_barang_or_jasa: body.nama_barang_or_jasa || null, // Store the name directly
      nama_satuan_ukur: body.nama_satuan_ukur,
      harga_satuan: parseFloat(body.harga_satuan),
      jumlah_barang: body.barang_or_jasa === 'a' ? parseInt(body.jumlah_barang_jasa) : null,
      jumlah_jasa: body.barang_or_jasa === 'b' ? parseInt(body.jumlah_barang_jasa) : null,
      diskon_persen: body.total_diskon ? parseFloat(body.total_diskon) : null,
      dpp: parseFloat(body.dpp),
      dpp_nilai_lain: parseFloat(body.dpp_nilai_lain),
      tarif_ppn: parseFloat(body.tarif_ppn),
      ppn: parseFloat(body.ppn),
      tarif_ppnbm: body.tarif_ppnbm ? parseFloat(body.tarif_ppnbm) : null,
      ppnbm: body.ppnbm ? parseFloat(body.ppnbm) : null,
    };

    console.log('Transformed data:', detailData); // Debug log

    const result = await taxDb.insert(fakturDetail).values(detailData);
    return NextResponse.json(detailData);
  } catch (error) {
    console.error('Error in detail-faktur POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create detail faktur' },
      { status: 500 }
    );
  }
}