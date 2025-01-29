// src/app/(dashboard)/(dashboard)/invoices/page.tsx
'use client'

import  InvoiceTable  from '@/components/invoice/invoice-table'

export default function InvoicesPage() {
  return (
    <div className="container py-6">
      <InvoiceTable />
    </div>
  )
}