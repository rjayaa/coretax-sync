// src/app/api/sync-coretax/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoretaxService } from '@/lib/services/coretax-service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }
    
    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Format file harus .xlsx' }, { status: 400 });
    }
    
    // Read file as buffer
    const buffer = await file.arrayBuffer();
    
    // Process file
    const syncResults = await CoretaxService.syncFromExcel(buffer);
    
    return NextResponse.json(syncResults);
  } catch (error: any) {
    console.error('Error syncing Coretax data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}