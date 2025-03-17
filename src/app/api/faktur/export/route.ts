// src/app/api/faktur/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fakturIds } = body;
    
    if (!fakturIds || !Array.isArray(fakturIds) || fakturIds.length === 0) {
      return NextResponse.json({ error: 'Invalid faktur IDs' }, { status: 400 });
    }
    
    // Get faktur data
    const fakturs = await db.select()
      .from(faktur)
      .where(inArray(faktur.id, fakturIds));
      
    // Get details for all selected fakturs
    const details = await db.select()
      .from(fakturDetail)
      .where(inArray(fakturDetail.id_faktur, fakturIds));
    
    // Format data for export
    const formattedFakturs = fakturs.map(faktur => ({
      ID: faktur.id,
      Referensi: faktur.referensi,
      TanggalFaktur: faktur.tanggal_faktur,
      NPWP_Penjual: faktur.npwp_penjual,
      NPWP_Pembeli: faktur.npwp_nik_pembeli,
      NamaPembeli: faktur.nama_pembeli,
      AlamatPembeli: faktur.alamat_pembeli,
      JenisFaktur: faktur.jenis_faktur,
      StatusFaktur: faktur.status_faktur,
      // Add other fields as needed
    }));
    
    const formattedDetails = details.map(detail => ({
      ID_Detail: detail.id_detail_faktur,
      ID_Faktur: detail.id_faktur,
      NamaBarangJasa: detail.nama_barang_or_jasa,
      SatuanUkur: detail.nama_satuan_ukur,
      JumlahBarang: detail.jumlah_barang,
      HargaSatuan: detail.harga_satuan,
      DPP: detail.dpp,
      PPN: detail.ppn,
      // Add other fields as needed
    }));
    
    return NextResponse.json({
      fakturs: formattedFakturs,
      details: formattedDetails
    });
    
  } catch (error: any) {
    console.error('Error exporting fakturs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
