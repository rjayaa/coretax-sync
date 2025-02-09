import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'
import type { Customer, Item, Company } from '@/types/tax-invoice'

interface PaymentDetails {
  nominal: number
  dpp: number
  ppn: number
}

export function useInvoiceForm() {
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
    loadCompanyData()
  }, [])

  const loadCompanyData = () => {
    const companyStr = localStorage.getItem('selectedCompany')
    if (!companyStr) {
      handleCompanyNotFound()
      return
    }

    try {
      const company = JSON.parse(companyStr)
      validateCompanyData(company)
    } catch (e) {
      handleCompanyError(e)
    }
  }

  const validateCompanyData = (company: Company) => {
    if (!company?.company_code || !company?.company_name) {
      handleInvalidCompanyData(company)
      return
    }
    setSelectedCompany(company)
  }

  const handleCompanyNotFound = () => {
    console.log('No company data found')
    toast({
      title: "Info",
      description: "Silakan pilih perusahaan terlebih dahulu",
    })
    router.push('/user/company-selection')
  }

  const handleInvalidCompanyData = (company: Company) => {
    console.warn('Company data incomplete:', company)
    toast({
      title: "Peringatan",
      description: "Data perusahaan tidak lengkap. Silakan pilih perusahaan kembali.",
      variant: "destructive"
    })
    router.push('/user/company-selection')
  }

  const handleCompanyError = (error: any) => {
    console.error('Error parsing company data:', error)
    toast({
      title: "Error",
      description: "Gagal memuat data perusahaan. Silakan pilih perusahaan kembali.",
      variant: "destructive"
    })
    router.push('/user/company-selection')
  }

  const validateForm = () => {
    if (!selectedCustomer?.npwp) {
      showError("Silakan pilih customer terlebih dahulu")
      return false
    }

    if (!selectedCompany?.company_code) {
      showError("Data perusahaan tidak lengkap")
      return false
    }

    if (items.length === 0) {
      showError("Silakan tambahkan minimal 1 item")
      return false
    }

    if (!validateItems()) {
      showError("Setiap item harus memiliki nama, unit, jumlah, dan harga yang valid")
      return false
    }

    return true
  }

  const validateItems = () => {
    return !items.some(item => {
      const hasRequiredFields = item.item_name && item.unit
      const hasValidQuantity = item.quantity > 0
      const hasValidPrice = item.unit_price > 0
      return !hasRequiredFields || !hasValidQuantity || !hasValidPrice
    })
  }

  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    })
  }

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
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { headerData, detailsData } = prepareInvoiceData()
      await submitInvoiceData(headerData, detailsData)
      handleSuccess()
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const prepareInvoiceData = () => {
    const invoiceId = uuidv4()
    const currentDate = new Date()
    
    const headerData = {
      id: invoiceId,
      customer_id: selectedCustomer!.id,
      company_code: selectedCompany!.company_code,
      transaction_type: 'FULL_PAYMENT' as const,
      invoice_date: currentDate.toISOString(),
      invoice_type: 'Normal',
      transaction_code: `INV/${currentDate.getFullYear()}/${invoiceId.slice(0, 8)}`,
      buyer_doc_type: 'TIN',
      buyer_country: 'IDN',
      buyer_doc_number: selectedCustomer!.npwp,
      buyer_email: '',
      created_by: session!.user!.username
    }

    const detailsData = prepareDetailsData(invoiceId)

    return { headerData, detailsData }
  }

  const prepareDetailsData = (invoiceId: string) => {
    return items.map(item => {
      const itemPrice = Number(item.unit_price) * Number(item.quantity)
      const itemDPP = Number((itemPrice * 11 / 12).toFixed(2))
      const itemPPN = Number((itemDPP * 0.12).toFixed(2))
      
      return {
        id: uuidv4(),
        invoice_id: invoiceId,
        item_type: item.item_type,
        goods_id: item.goods_id || null,
        service_id: item.service_id || null,
        item_name: item.item_name.trim(),
        unit: item.unit,
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        total_price: itemPrice,
        discount: 0,
        down_payment: 0,
        dpp: itemDPP,
        dpp_other: 0,
        ppn_rate: 12.00,
        ppn: itemPPN,
        ppnbm_rate: 10.00,
        ppnbm: 0,
        created_by: session!.user!.username
      }
    })
  }

  const submitInvoiceData = async (headerData: any, detailsData: any[]) => {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ header: headerData, details: detailsData }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create invoice')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to create invoice')
    }
  }

  const handleSuccess = () => {
    toast({
      title: "Sukses",
      description: "Faktur berhasil disimpan",
    })
    router.push('/user/invoices')
    router.refresh()
  }

  const handleError = (error: any) => {
    console.error('Error creating invoice:', error)
    setError(error instanceof Error ? error.message : 'Gagal membuat faktur')
    toast({
      title: "Error",
      description: "Gagal menyimpan faktur. Silakan coba lagi.",
      variant: "destructive"
    })
  }

  return {
    selectedCustomer,
    selectedCompany,
    items,
    paymentDetails,
    isLoading,
    error,
    isFormValid,
    setSelectedCustomer,
    setItems,
    setPaymentDetails,
    handleSubmit,
    router
  }
}