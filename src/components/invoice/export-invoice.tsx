// components/invoice/export-invoice.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Download } from 'lucide-react'
import type { InvoiceHeader } from '@/types/tax-invoice'

interface Props {
  selectedInvoices: InvoiceHeader[]
  onExportStart?: () => void
  onExportComplete?: () => void
}

export function ExportInvoice({ 
  selectedInvoices,
  onExportStart,
  onExportComplete
}: Props) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: 'Tidak ada faktur yang dipilih',
        description: 'Pilih faktur yang akan diekspor terlebih dahulu',
        variant: 'destructive'
      })
      return
    }

    setIsExporting(true)
    onExportStart?.()

    try {
      const response = await fetch('/api/invoices/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceIds: selectedInvoices.map(inv => inv.id)
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Export failed')
      }

      // Create and download header CSV
      const headerBlob = new Blob([data.data.headers], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const headerUrl = window.URL.createObjectURL(headerBlob)
      const headerLink = document.createElement('a')
      headerLink.href = headerUrl
      headerLink.download = `faktur_header_${new Date().toISOString()}.csv`
      document.body.appendChild(headerLink)
      headerLink.click()
      document.body.removeChild(headerLink)

      // Create and download detail CSV
      const detailBlob = new Blob([data.data.details], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const detailUrl = window.URL.createObjectURL(detailBlob)
      const detailLink = document.createElement('a')
      detailLink.href = detailUrl
      detailLink.download = `faktur_detail_${new Date().toISOString()}.csv`
      document.body.appendChild(detailLink)
      detailLink.click()
      document.body.removeChild(detailLink)

      toast({
        title: 'Export Berhasil',
        description: `${selectedInvoices.length} faktur telah berhasil diekspor`
      })

    } catch (error) {
      console.error('Error exporting invoices:', error)
      toast({
        title: 'Export Gagal',
        description: 'Terjadi kesalahan saat mengekspor faktur',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
      onExportComplete?.()
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || selectedInvoices.length === 0}
      className="min-w-[150px]"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? 'Mengekspor...' : 'Export CSV'}
    </Button>
  )
}