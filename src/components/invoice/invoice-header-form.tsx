// 'use client'

// import { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Search, Building2 } from 'lucide-react'
// import { cn } from '@/lib/utils'

// interface Customer {
//   id: string
//   nama: string
//   npwp: string
//   alamatLengkap: string
// }

// interface CustomerSelectorProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onSelect: (customer: Customer) => void
// }

// // Customer Selector Dialog Component
// function CustomerSelector({ open, onOpenChange, onSelect }: CustomerSelectorProps) {
//   const [customers, setCustomers] = useState<Customer[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       if (!open) return
      
//       setIsLoading(true)
//       try {
//         const response = await fetch('/api/customers')
//         if (!response.ok) throw new Error('Failed to fetch customers')
//         const data = await response.json()
//         setCustomers(data.customers)
//       } catch (error) {
//         console.error('Error fetching customers:', error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchCustomers()
//   }, [open])

//   const filteredCustomers = customers.filter(customer =>
//     customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     customer.npwp.includes(searchTerm)
//   )

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Pilih Customer</DialogTitle>
//         </DialogHeader>

//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Cari berdasarkan nama atau NPWP..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-9"
//           />
//         </div>

//         <ScrollArea className="h-96">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-muted-foreground">Memuat data...</p>
//             </div>
//           ) : filteredCustomers.length === 0 ? (
//             <div className="flex items-center justify-center h-full">
//               <p className="text-muted-foreground">Tidak ada data customer</p>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               {filteredCustomers.map((customer) => (
//                 <Button
//                   key={customer.id}
//                   variant="ghost"
//                   className="w-full justify-start text-left h-auto py-4"
//                   onClick={() => {
//                     onSelect(customer)
//                     onOpenChange(false)
//                   }}
//                 >
//                   <div className="flex gap-3">
//                     <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
//                     <div>
//                       <div className="font-medium">{customer.nama}</div>
//                       <div className="text-sm text-muted-foreground space-y-1">
//                         <div>NPWP: {customer.npwp}</div>
//                         <div className="text-xs">{customer.alamatLengkap}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </Button>
//               ))}
//             </div>
//           )}
//         </ScrollArea>
//       </DialogContent>
//     </Dialog>
//   )
// }

// // Main Invoice Header Form Component
// export function InvoiceHeaderForm() {
//   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
//   const [selectorOpen, setSelectorOpen] = useState(false)

//   return (
//     <div className="space-y-6 p-6 bg-card rounded-lg border">
//       {/* Header */}
//       <div>
//         <h3 className="text-lg font-semibold">Informasi Customer</h3>
//         <p className="text-sm text-muted-foreground">
//           Pilih customer untuk membuat invoice baru
//         </p>
//       </div>

//       {/* Customer Selection Area */}
//       <div className="space-y-4">
//         {/* Customer Selector Button */}
//         <div>
//           <Label>Customer</Label>
//           <Button
//             type="button"
//             variant="outline"
//             className={cn(
//               "w-full justify-start text-left h-auto py-3 relative",
//               !selectedCustomer && "text-muted-foreground"
//             )}
//             onClick={() => setSelectorOpen(true)}
//           >
//             {selectedCustomer ? (
//               <div className="flex items-center gap-2">
//                 <Building2 className="h-4 w-4" />
//                 <span>{selectedCustomer.nama}</span>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <Building2 className="h-4 w-4" />
//                 <span>Pilih customer...</span>
//               </div>
//             )}
//           </Button>
//         </div>

//         {/* Customer Details */}
//         {selectedCustomer && (
//           <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
//             <div>
//               <Label className="text-sm text-muted-foreground">NPWP</Label>
//               <div className="font-mono text-sm mt-1">{selectedCustomer.npwp}</div>
//             </div>
//             <div>
//               <Label className="text-sm text-muted-foreground">Alamat</Label>
//               <div className="text-sm mt-1">{selectedCustomer.alamatLengkap}</div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Customer Selector Dialog */}
//       <CustomerSelector
//         open={selectorOpen}
//         onOpenChange={setSelectorOpen}
//         onSelect={setSelectedCustomer}
//       />
//     </div>
//   )
// }
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
          Pilih customer untuk membuat invoice baru
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