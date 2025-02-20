import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { refKeteranganTambahan } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeTransaksi = searchParams.get('kodeTransaksi');

    if (!kodeTransaksi) {
      return NextResponse.json(
        { error: 'Kode transaksi is required' },
        { status: 400 }
      );
    }

    const keteranganTambahan = await taxDb
      .select()
      .from(refKeteranganTambahan)
      .where(eq(refKeteranganTambahan.kodeTransaksi, kodeTransaksi));

    return NextResponse.json(keteranganTambahan);
  } catch (error) {
    console.error('Error fetching keterangan tambahan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keterangan tambahan' },
      { status: 500 }
    );
  }
}