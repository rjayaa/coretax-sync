// src/app/api/faktur/not-exported/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { faktur } from '@/lib/db/schema/faktur';
import { desc, sql, eq, or, isNull } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Get fakturs that haven't been exported yet or need to be re-exported
    const fakturs = await db.select({
      id: faktur.id,
      referensi: faktur.referensi,
      tanggal_faktur: faktur.tanggal_faktur,
      nama_pembeli: faktur.nama_pembeli,
      npwp_nik_pembeli: faktur.npwp_nik_pembeli,
      status_faktur: faktur.status_faktur,
      is_uploaded_to_coretax: faktur.is_uploaded_to_coretax
    })
    .from(faktur)
    .where(
      or(
        eq(faktur.is_uploaded_to_coretax, false),
        isNull(faktur.is_uploaded_to_coretax)
      )
    )
    .orderBy(desc(sql`createdAt`))
    .limit(100);
    
    return NextResponse.json(fakturs);
  } catch (error: any) {
    console.error('Error fetching fakturs to export:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}