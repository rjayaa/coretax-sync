// app/api/keterangan-tambahan/route.ts
import { NextResponse } from 'next/server'
import { taxDb } from '@/lib/db'
import { refKeteranganTambahan, refKodeTransaksi } from '@/lib/db/index'
import { eq, and, like , or } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kodeTransaksi = searchParams.get('kodeTransaksi')
    const search = searchParams.get('search')

    let query = taxDb.select({
      id: refKeteranganTambahan.id,
      kode: refKeteranganTambahan.kode,
      keterangan: refKeteranganTambahan.keterangan,
      kodeTransaksi: refKeteranganTambahan.kodeTransaksi
    })
    .from(refKeteranganTambahan)
    
    // Filter berdasarkan kode transaksi jika ada
    if (kodeTransaksi) {
      query = query.where(eq(refKeteranganTambahan.kodeTransaksi, kodeTransaksi))
    }

    // Filter berdasarkan pencarian jika ada
    if (search) {
      query = query.where(
        or(
          like(refKeteranganTambahan.kodeTransaksi, `%${search}%`),
          like(refKeteranganTambahan.keterangan, `%${search}%`)
        )
      )
    }

    // Order by kode
    query = query.orderBy(refKeteranganTambahan.kode)

    const data = await query

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching keterangan tambahan:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Endpoint untuk mendapatkan keterangan tambahan berdasarkan kode transaksi
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kodeTransaksi } = body

    if (!kodeTransaksi) {
      return NextResponse.json(
        { error: 'Kode transaksi is required' },
        { status: 400 }
      )
    }

    // Validasi kode transaksi exists
    const kodeTransaksiExists = await taxDb
      .select({ kode: refKodeTransaksi.kode })
      .from(refKodeTransaksi)
      .where(eq(refKodeTransaksi.kode, kodeTransaksi))
      .limit(1)

    if (!kodeTransaksiExists.length) {
      return NextResponse.json(
        { error: 'Invalid kode transaksi' },
        { status: 400 }
      )
    }

    const data = await taxDb
      .select({
        id: refKeteranganTambahan.id,
        kode: refKeteranganTambahan.kode,
        keterangan: refKeteranganTambahan.keterangan
      })
      .from(refKeteranganTambahan)
      .where(eq(refKeteranganTambahan.kodeTransaksi, kodeTransaksi))
      .orderBy(refKeteranganTambahan.kode)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching keterangan tambahan by kode transaksi:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}