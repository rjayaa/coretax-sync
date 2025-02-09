'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { InvoiceHeaderForm } from './invoice-header-form'
import { TransactionDetailForm } from './transaction-detail-form'
import { useInvoiceForm } from '@/hooks/use-invoice-form'
import { useQuery } from '@tanstack/react-query'

interface TransactionItem {
  kodeTransaksi: string;
  itemType: 'B' | 'J';
  kode: string;
  nama: string;
  satuan: string;
  hargaSatuan: string;
  kuantitas: string;
  totalHarga: string;
  potonganHarga: string;
  dppNilaiLain: boolean;
  dppValue: string;
  tarifPPN: string;
  ppnValue: string;
  tarifPPnBM: string;
  ppnbmValue: string;
}

export function CreateInvoiceForm() {
  const {
    selectedCustomer,
    isLoading,
    error,
    kodeTransaksiList,
    setSelectedCustomer,
    setTransaction,
  } = useInvoiceForm()

  const handleTransactionSubmit = (data: TransactionItem) => {
    setTransaction(data)
  }
  const { data: keteranganTambahanList } = useQuery({
    queryKey: ['keteranganTambahan'],
    queryFn: async () => {
      const response = await fetch('/api/keterangan-tambahan')
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    }
  })
  return (
    <div className="space-y-6">
      <Header />
    
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <InvoiceHeaderForm 
        onCustomerSelect={setSelectedCustomer}
        selectedCustomer={selectedCustomer}
        isLoading={isLoading}
      />

      <TransactionDetailForm
        onSubmit={handleTransactionSubmit}
        keteranganTambahanList={keteranganTambahanList || []} // Pass the data here
      />


    
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buat Faktur Baru</h2>
        <p className="text-muted-foreground">
          Isi informasi customer dan detail item untuk membuat faktur
        </p>
      </div>
    </div>
  )
}