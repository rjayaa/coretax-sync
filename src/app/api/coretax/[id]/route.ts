// src/app/api/coretax/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoretaxService } from '@/lib/services/coretax-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const coretaxData = await CoretaxService.getCoretaxDataById(recordId);
    
    if (!coretaxData) {
      return NextResponse.json(
        { error: 'Data Coretax tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(coretaxData);
  } catch (error: any) {
    console.error('Error fetching Coretax data:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}