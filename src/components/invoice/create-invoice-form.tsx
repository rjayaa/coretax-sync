'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { InvoiceHeaderForm } from './invoice-header-form'
import { ItemDetailForm } from './item-detail-form'
import { PaymentDetailsForm } from './payment-details-form'
import { useInvoiceForm } from '@/hooks/use-invoice-form'

export function CreateInvoiceForm() {
  const {
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
  } = useInvoiceForm()

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

      <ItemDetailForm
        items={items}
        onItemsChange={setItems}
      />

      <PaymentDetailsForm
        onValuesChange={setPaymentDetails}
      />

      <FormActions 
        isLoading={isLoading}
        isFormValid={isFormValid}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />

      <DebugInfo 
        selectedCustomer={selectedCustomer}
        selectedCompany={selectedCompany}
        items={items}
        isFormValid={isFormValid}
        isLoading={isLoading}
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

interface FormActionsProps {
  isLoading: boolean
  isFormValid: boolean
  onSubmit: () => void
  onCancel: () => void
}

function FormActions({ isLoading, isFormValid, onSubmit, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Batal
      </Button>
      <Button
        onClick={onSubmit}
        disabled={!isFormValid}
        className="min-w-[200px]"
      >
        {isLoading ? 'Menyimpan...' : 'Simpan Faktur'}
      </Button>
    </div>
  )
}

interface DebugInfoProps {
  selectedCustomer: any
  selectedCompany: any
  items: any[]
  isFormValid: boolean
  isLoading: boolean
}

function DebugInfo({ selectedCustomer, selectedCompany, items, isFormValid, isLoading }: DebugInfoProps) {
  return (
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
          isLoading
        }
      }, null, 2)}
    </pre>
  )
}