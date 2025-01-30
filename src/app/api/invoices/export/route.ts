// app/api/invoices/export/route.ts

import { NextResponse } from 'next/server'
import { taxDb } from '@/lib/db'
import { 
  taxInvoiceHeader, 
  taxInvoiceDetail,
  taxMasterCustomer 
} from '@/lib/db/schema/tax'
import { eq, and, inArray } from 'drizzle-orm'
import { prepareInvoiceExport } from '@/lib/utils/invoice-export'

export async function POST(req: Request) {
  try {
    const { invoiceIds } = await req.json()

    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid invoice IDs' }, 
        { status: 400 }
      )
    }

    // Fetch invoices with related data
    const invoices = await taxDb.select()
      .from(taxInvoiceHeader)
      .where(inArray(taxInvoiceHeader.id, invoiceIds))

    const details = await taxDb.select()
      .from(taxInvoiceDetail)
      .where(inArray(taxInvoiceDetail.invoice_id, invoiceIds))

    const customers = await taxDb.select()
      .from(taxMasterCustomer)
      .where(
        inArray(
          taxMasterCustomer.id, 
          invoices.map(inv => inv.customer_id)
        )
      )

    // Group details by invoice
    const detailsByInvoice = details.reduce((acc, detail) => {
      if (!acc[detail.invoice_id]) {
        acc[detail.invoice_id] = []
      }
      acc[detail.invoice_id].push(detail)
      return acc
    }, {} as Record<string, typeof details>)

    // Customer lookup
    const customerMap = customers.reduce((acc, customer) => {
      acc[customer.id] = customer
      return acc
    }, {} as Record<string, typeof customers[0]>)

    // Prepare export data
    const headerRows: string[] = []
    const detailRows: string[] = []

    // Add headers
    headerRows.push([
      'FK',
      'KD_JENIS_TRANSAKSI',
      'FG_PENGGANTI',
      'NOMOR_FAKTUR',
      'TANGGAL_FAKTUR',
      'NPWP',
      'NAMA',
      'ALAMAT_LENGKAP',
      'DPP',
      'PPN',
      'PPNBM',
      'IS_CREDITABLE',
      'REFERENSI'
    ].join(';'))

    detailRows.push([
      'FK',
      'KD_JENIS_TRANSAKSI',
      'FG_PENGGANTI',
      'NOMOR_FAKTUR',
      'NAMA_BARANG',
      'HARGA_SATUAN',
      'JUMLAH_BARANG',
      'HARGA_TOTAL',
      'DISKON',
      'DPP',
      'PPN',
      'TARIF_PPNBM',
      'PPNBM'
    ].join(';'))

    // Process each invoice
    for (const invoice of invoices) {
      const customer = customerMap[invoice.customer_id]
      const invoiceDetails = detailsByInvoice[invoice.id] || []

      const { header, details } = prepareInvoiceExport(
        invoice,
        customer,
        invoiceDetails
      )

      // Add to CSV rows
      headerRows.push(Object.values(header).join(';'))
      details.forEach(detail => {
        detailRows.push(Object.values(detail).join(';'))
      })
    }

    // Create CSV content
    const headerCSV = headerRows.join('\n')
    const detailCSV = detailRows.join('\n')

    // Return both files
    return NextResponse.json({
      success: true,
      data: {
        headers: headerCSV,
        details: detailCSV
      }
    })

  } catch (error) {
    console.error('Error exporting invoices:', error)
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    )
  }
}