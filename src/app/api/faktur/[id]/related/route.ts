// src/app/api/faktur/[id]/related/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoretaxService } from '@/lib/services/coretax-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    const related = await CoretaxService.getRelatedTransactions(fakturId);
    return NextResponse.json(related);
  } catch (error: any) {
    console.error('Error fetching related transactions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}