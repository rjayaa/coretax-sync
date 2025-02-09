'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Building2 } from 'lucide-react'
import { useCustomers } from '@/hooks/use-customer'
import { cn } from '@/lib/utils'
import type { taxMasterCustomer } from '@/lib/db/schema/master'

type Customer = typeof taxMasterCustomer.$inferSelect;

interface CustomerSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (customer: Customer) => void
}

export function CustomerSelector({
  open,
  onOpenChange,
  onSelect
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: customersResponse, isLoading } = useCustomers()

  // Pastikan akses data customer dengan benar
  const filteredCustomers = (customersResponse?.data || []).filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.npwp.includes(searchTerm)
  )

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Customer selected in selector:', customer)
    onSelect(customer)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pilih Customer</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama atau NPWP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Tidak ada customer yang sesuai dengan pencarian'
                  : 'Tidak ada data customer'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-4"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">{customer.nama}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>NPWP: {customer.npwp}</div>
                        <div className="text-xs">Alamat: {customer.jalan}</div>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}