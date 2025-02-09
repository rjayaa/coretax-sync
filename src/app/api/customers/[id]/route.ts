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
    const invoice = await taxDb.query.faktur.findFirst({
      where: eq(faktur.id, params.id),
      with: {
        details: true,
        kodeTransaksiRef: true,
        jenisIdPembeliRef: true,
        keteranganTambahanRef: true,
        capFasilitasRef: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}