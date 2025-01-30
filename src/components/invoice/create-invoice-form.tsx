// 'use client'

// import { useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { InvoiceHeaderForm } from './invoice-header-form'
// import { ItemDetailForm } from './item-detail-form'
// import { PaymentDetailsForm } from './payment-details-form'
// import { v4 as uuidv4 } from 'uuid'
// import type { Customer, Item } from '@/types/tax-invoice'

// interface PaymentDetails {
//   nominal: number
//   dpp: number
//   ppn: number
// }

// export function CreateInvoiceForm() {
//   const router = useRouter()
//   const { data: session } = useSession()
//   const [isLoading, setIsLoading] = useState(false)
  
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
//   const [items, setItems] = useState<Item[]>([])
//   const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
//     nominal: 0,
//     dpp: 0,
//     ppn: 0
//   })

//   const handleSubmit = async () => {
//     if (!selectedCustomer || items.length === 0 || !session?.user) {
//       return
//     }

//     setIsLoading(true)

//     try {
//       const invoiceId = uuidv4()
//       const selectedCompany = JSON.parse(localStorage.getItem('selectedCompany') || '{}')
      
//       // Prepare invoice header data
//       const headerData = {
//         id: invoiceId,
//         customer_id: selectedCustomer.id,
//         company_id: selectedCompany.id,
//         transaction_type: 'Regular',
//         invoice_date: new Date(),
//         invoice_type: 'Normal',
//         transaction_code: `INV/${new Date().getFullYear()}/${invoiceId.slice(0, 8)}`,
//         created_by: session.user.username,
//       }

//       // Prepare invoice details data
//       const detailsData = items.map(item => ({
//         id: uuidv4(),
//         invoice_id: invoiceId,
//         item_type: item.item_type,
//         goods_id: item.goods_id,
//         service_id: item.service_id,
//         item_name: item.item_name,
//         unit: item.unit,
//         unit_price: item.unit_price,
//         quantity: item.quantity,
//         total_price: item.total_price,
//         dpp: paymentDetails.dpp,
//         dpp_other: 0,
//         ppn_rate: 12.00,
//         ppn: paymentDetails.ppn,
//         ppnbm_rate: 10.00,
//         ppnbm: 0,
//         created_by: session.user.username
//       }))

//       const response = await fetch('/api/invoices', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           header: headerData,
//           details: detailsData
//         }),
//       })

//       if (!response.ok) {
//         throw new Error('Failed to create invoice')
//       }

//       router.push('/invoices')
//       router.refresh()
//     } catch (error) {
//       console.error('Error creating invoice:', error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Buat Faktur Baru</h2>
//           <p className="text-muted-foreground">
//             Isi informasi customer dan detail item untuk membuat faktur
//           </p>
//         </div>
//         <Button
//           onClick={handleSubmit}
//           disabled={isLoading || !selectedCustomer || items.length === 0}
//           className="min-w-[200px]"
//         >
//           {isLoading ? 'Menyimpan...' : 'Simpan Faktur'}
//         </Button>
//       </div>

//       <InvoiceHeaderForm 
//         onCustomerSelect={setSelectedCustomer}
//       />

//       <ItemDetailForm
//         items={items}
//         onItemsChange={setItems}
//       />

//       <PaymentDetailsForm
//         onValuesChange={setPaymentDetails}
//       />
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InvoiceHeaderForm } from './invoice-header-form'
import { ItemDetailForm } from './item-detail-form'
import { PaymentDetailsForm } from './payment-details-form'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { v4 as uuidv4 } from 'uuid'
import type { Customer, Item, TransactionType } from '@/types/tax-invoice'



interface PaymentDetails {
  nominal: number;
  dpp: number;
  ppn: number;
}

export function CreateInvoiceForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    nominal: 0,
    dpp: 0,
    ppn: 0
  })

 useEffect(() => {
    const companyStr = localStorage.getItem('selectedCompany')
    if (companyStr) {
      try {
        const company = JSON.parse(companyStr)
        console.log('Loaded company:', company)
        
        // Periksa minimal ada company_code dan company_name
        if (!company?.company_code || !company?.company_name) {
          console.warn('Company data incomplete:', company)
          toast({
            title: "Peringatan",
            description: "Data perusahaan tidak lengkap. Silakan pilih perusahaan kembali.",
            variant: "destructive"
          })
          router.push('/company-selection')
          return
        }
        
        setSelectedCompany(company)
      } catch (e) {
        console.error('Error parsing company data:', e)
        toast({
          title: "Error",
          description: "Gagal memuat data perusahaan. Silakan pilih perusahaan kembali.",
          variant: "destructive"
        })
        router.push('/company-selection')
      }
    } else {
      console.log('No company data found')
      toast({
        title: "Info",
        description: "Silakan pilih perusahaan terlebih dahulu",
      })
      router.push('/company-selection')
    }
  }, []) // Hapus dependencies yang tidak perlu

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Selected customer:', customer)
    setSelectedCustomer(customer)
  }

 const validateForm = () => {
    if (!selectedCustomer?.npwp) {
      toast({
        title: "Error",
        description: "Silakan pilih customer terlebih dahulu",
        variant: "destructive"
      })
      return false
    }

    if (!selectedCompany?.company_code) {
      toast({
        title: "Error",
        description: "Data perusahaan tidak lengkap",
        variant: "destructive"
      })
      return false
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Silakan tambahkan minimal 1 item",
        variant: "destructive"
      })
      return false
    }

    // Validasi setiap item
    const invalidItems = items.filter(item => {
      const hasRequiredFields = item.item_name && item.unit;
      const hasValidQuantity = item.quantity > 0;
      const hasValidPrice = item.unit_price > 0;
      
      console.log('Item validation:', {
        item,
        hasRequiredFields,
        hasValidQuantity,
        hasValidPrice
      });
      
      return !hasRequiredFields || !hasValidQuantity || !hasValidPrice;
    });

    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description: "Setiap item harus memiliki nama, unit, jumlah, dan harga yang valid",
        variant: "destructive"
      })
      return false
    }

    return true
  }

interface Company {
  id: string;
  company_name: string;
  company_code: string;
  npwp_company?: string;
  status?: string;
}

// Update isFormValid check
const isFormValid = Boolean(
    selectedCustomer?.npwp &&
    selectedCompany?.company_code &&
    items.length > 0 &&
    items.every(item => 
      item.item_name &&
      item.unit &&
      item.quantity > 0 &&
      item.unit_price > 0
    ) &&
    !isLoading &&
    session?.user?.username
  )

    const handleSubmit = async () => {
    console.log('Submit clicked with state:', {
      customer: selectedCustomer,
      company: selectedCompany,
      items,
      isFormValid
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true)

    try {
      const invoiceId = uuidv4()
      
      // Prepare invoice header data
      const headerData = {
        id: invoiceId,
        customer_id: selectedCustomer!.id,
        company_code: selectedCompany!.company_code,
        transaction_type: 'FULL_PAYMENT',
        invoice_date: new Date().toISOString(),
        invoice_type: 'Normal',
        transaction_code: `INV/${new Date().getFullYear()}/${invoiceId.slice(0, 8)}`,
        status: 'DRAFT',
        buyer_doc_type: 'TIN',
        buyer_country: 'IDN',
        buyer_doc_number: selectedCustomer!.npwp,
        buyer_email: '',
        created_by: session!.user!.username
      }

      // Prepare invoice details data
      const detailsData = items.map(item => ({
        id: uuidv4(),
        invoice_id: invoiceId,
        item_type: item.item_type,
        goods_id: item.goods_id || null,
        service_id: item.service_id || null,
        item_name: item.item_name,
        unit: item.unit,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        total_price: Number(item.unit_price) * Number(item.quantity),
        discount: 0,
        down_payment: 0,
        dpp: paymentDetails.dpp,
        dpp_other: 0,
        ppn_rate: 12.00,
        ppn: paymentDetails.ppn,
        ppnbm_rate: 10.00,
        ppnbm: 0,
        created_by: session!.user!.username
      }))

      console.log('Submitting data:', { headerData, detailsData })

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          header: headerData,
          details: detailsData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      toast({
        title: "Sukses",
        description: "Faktur berhasil disimpan",
      })

      router.push('/invoices')
      router.refresh()

    } catch (error) {
      console.error('Error creating invoice:', error)
      setError(error instanceof Error ? error.message : 'Gagal membuat faktur')
      toast({
        title: "Error",
        description: "Gagal menyimpan faktur. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buat Faktur Baru</h2>
          <p className="text-muted-foreground">
            Isi informasi customer dan detail item untuk membuat faktur
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <InvoiceHeaderForm 
        onCustomerSelect={handleCustomerSelect}
        selectedCustomer={selectedCustomer}
        isLoading={isLoading}
      />

      <ItemDetailForm
        items={items}
        onItemsChange={setItems}
      />

      <PaymentDetailsForm
        onValuesChange={setPaymentDetails}
      />

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="min-w-[200px]"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Faktur'}
        </Button>
      </div>

      {/* Debug information */}
      <pre className="text-xs mt-8 p-4 bg-muted rounded-lg overflow-auto">
        {JSON.stringify({
          customer: selectedCustomer ? {
            id: selectedCustomer.id,
            nama: selectedCustomer.nama,
            npwp: selectedCustomer.npwp
          } : null,
          company: selectedCompany ? {
            id: selectedCompany.id,
            name: selectedCompany.company_name,
            code: selectedCompany.company_code
          } : null,
          itemsCount: items.length,
          isValid: isFormValid,
          validationDetails: {
            hasCustomerId: Boolean(selectedCustomer?.id),
            hasCompanyId: Boolean(selectedCompany?.id),
            hasItems: items.length > 0,
            isLoading,
            hasUsername: Boolean(session?.user?.username)
          }
        }, null, 2)}
      </pre>
    </div>
  )
}