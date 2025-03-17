// src/app/api/faktur/[id]/amended/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoretaxService } from '@/lib/services/coretax-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fakturId = params.id;
    const amendedFakturs = await CoretaxService.getAmendedFakturs(fakturId);
    return NextResponse.json(amendedFakturs);
  } catch (error: any) {
    console.error('Error fetching amended fakturs:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}