import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { refKodeTransaksi } from '@/lib/db/schema';

export async function GET() {
  try {
    const kodeTransaksi = await taxDb.select().from(refKodeTransaksi);
    return NextResponse.json(kodeTransaksi);
  } catch (error) {
    console.error('Error fetching kode transaksi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kode transaksi' },
      { status: 500 }
    );
  }
}