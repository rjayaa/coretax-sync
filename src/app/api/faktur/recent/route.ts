// src/app/api/faktur/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { desc, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const recentFakturs = await db.select({
      id: faktur.id,
      referensi: faktur.referensi,
      tanggal_faktur: faktur.tanggal_faktur,
      nama_pembeli: faktur.nama_pembeli,
      status_faktur: faktur.status_faktur,
      nomor_faktur_pajak: faktur.nomor_faktur_pajak,
      is_uploaded_to_coretax: faktur.is_uploaded_to_coretax
    })
    .from(faktur)
    .orderBy(desc(sql`createdAt`))
    .limit(10);
    
    return NextResponse.json(recentFakturs);
  } catch (error: any) {
    console.error('Error fetching recent fakturs:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}