import { NextResponse } from 'next/server';
import { taxDb } from '@/lib/db';
import { refCapFasilitas } from '@/lib/db/schema';
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

    const capFasilitas = await taxDb
      .select()
      .from(refCapFasilitas)
      .where(eq(refCapFasilitas.kodeTransaksi, kodeTransaksi));

    return NextResponse.json(capFasilitas);
  } catch (error) {
    console.error('Error fetching cap fasilitas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cap fasilitas' },
      { status: 500 }
    );
  }
}