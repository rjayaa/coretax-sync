// src/app/api/invoices/[id]/route.ts
import { NextResponse } from 'next/server'
import { taxDb } from '@/lib/db'
import { faktur } from '@/lib/db/schema/faktur'
import { detailFaktur } from '@/lib/db/schema/detail-faktur'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await taxDb
      .select({
        faktur: {
          id: faktur.id,
          nomorFaktur: faktur.nomorFaktur,
          tanggalFaktur: faktur.tanggalFaktur,
          jenisFaktur: faktur.jenisFaktur,
          kodeTransaksi: faktur.kodeTransaksi,
          nomorInvoice: faktur.nomorInvoice,
          npwpPembeli: faktur.npwpPembeli,
          namaPembeli: faktur.namaPembeli,
          alamatPembeli: faktur.alamatPembeli,
          emailPembeli: faktur.emailPembeli,
          dppTotal: faktur.dppTotal,
          ppnTotal: faktur.ppnTotal,
          ppnbmTotal: faktur.ppnbmTotal,
          status: faktur.status,
        },
        details: {
          id: detailFaktur.id,
          nomorUrut: detailFaktur.nomorUrut,
          namaBarangJasa: detailFaktur.namaBarangJasa,
          kodeBarangJasa: detailFaktur.kodeBarangJasa,
          hargaSatuan: detailFaktur.hargaSatuan,
          jumlah: detailFaktur.jumlah,
          hargaTotal: detailFaktur.hargaTotal,
          diskon: detailFaktur.diskon,
          dpp: detailFaktur.dpp,
          ppn: detailFaktur.ppn,
          ppnbm: detailFaktur.ppnbm,
        }
      })
      .from(faktur)
      .leftJoin(detailFaktur, eq(detailFaktur.fakturId, faktur.id))
      .where(eq(faktur.id, params.id));

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Transform result to expected format
    const invoice = result[0].faktur;
    const details = result.map(r => r.details).filter(d => d.id !== null);

    return NextResponse.json({
      data: {
        ...invoice,
        details
      }
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}