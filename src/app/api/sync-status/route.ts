// src/app/api/sync-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoretaxService } from '@/lib/services/coretax-service';

export async function GET(req: NextRequest) {
  try {
    const syncStatus = await CoretaxService.getSyncStatus();
    return NextResponse.json(syncStatus);
  } catch (error: any) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}