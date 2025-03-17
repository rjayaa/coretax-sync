// src/app/api/faktur/[id]/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fakturDetail } from '@/lib/db/schema/detail-faktur';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    const details = await db.select()
      .from(fakturDetail)
      .where(eq(fakturDetail.id_faktur, fakturId));
    
    return NextResponse.json(details);
  } catch (error: any) {
    console.error('Error fetching faktur details:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}