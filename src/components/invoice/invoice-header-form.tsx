
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CustomerSelector } from './customer-selector-dialog'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types/tax-invoice'

interface InvoiceHeaderFormProps {
  onCustomerSelect: (customer: Customer) => void
  selectedCustomer: Customer | null
  isLoading?: boolean
}

export function InvoiceHeaderForm({ 
  onCustomerSelect,
  selectedCustomer,
  isLoading 
}: InvoiceHeaderFormProps) {
  const [selectorOpen, setSelectorOpen] = useState(false)

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Selected customer in header:', customer)
    onCustomerSelect(customer)
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold">Informasi Customer</h3>
        <p className="text-sm text-muted-foreground">
          Pilih customer untuk membuat faktur baru
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Customer</Label>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left h-auto py-3 relative",
              !selectedCustomer && "text-muted-foreground"
            )}
            onClick={() => setSelectorOpen(true)}
            disabled={isLoading}
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{selectedCustomer.nama}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Pilih customer...</span>
              </div>
            )}
          </Button>
        </div>

        {selectedCustomer && (
          <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm text-muted-foreground">NPWP</Label>
              <div className="font-mono text-sm mt-1">{selectedCustomer.npwp}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Alamat</Label>
              <div className="text-sm mt-1">{selectedCustomer.alamatLengkap}</div>
            </div>
          </div>
        )}

        <CustomerSelector
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          onSelect={handleCustomerSelect}
        />
      </div>
    </div>
  )
}