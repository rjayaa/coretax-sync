
// src/app/api/faktur/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { inArray } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fakturIds } = body;
    
    if (!fakturIds || !Array.isArray(fakturIds) || fakturIds.length === 0) {
      return NextResponse.json({ error: 'Invalid faktur IDs' }, { status: 400 });
    }
    
    console.log(`Exporting data for faktur IDs: ${fakturIds.join(', ')}`);
    
    // Get faktur data dengan semua properti yang dibutuhkan
    const fakturs = await db.select()
      .from(faktur)
      .where(inArray(faktur.id, fakturIds));
    
    console.log(`Found ${fakturs.length} fakturs for export`);
    
    // Format tanggal untuk ekspor jika perlu
    const preparedFakturs = fakturs.map(item => {
      // Pastikan tanggal faktur dalam format string YYYY-MM-DD
      let tanggalFormatted = item.tanggal_faktur;
      
      if (item.tanggal_faktur instanceof Date) {
        tanggalFormatted = item.tanggal_faktur.toISOString().split('T')[0];
      } else if (typeof item.tanggal_faktur === 'string' && item.tanggal_faktur.includes('T')) {
        tanggalFormatted = item.tanggal_faktur.split('T')[0];
      }
      
      // Memastikan semua field yang dibutuhkan tersedia
      return {
        ...item,
        tanggal_faktur: tanggalFormatted,
        referensi: item.referensi || '',
        keterangan_tambahan: item.keterangan_tambahan || '',
        dokumen_pendukung: item.dokumen_pendukung || '',
        cap_fasilitas: item.cap_fasilitas || '',
        nomor_dokumen_pembeli: item.nomor_dokumen_pembeli || '',
        email_pembeli: item.email_pembeli || '',
      };
    });
    
    return NextResponse.json({
      fakturs: preparedFakturs
    });
    
  } catch (error: any) {
    console.error('Error exporting fakturs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}