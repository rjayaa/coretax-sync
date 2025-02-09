// src/components/invoice/kode-transaksi-selector.tsx
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
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface KeteranganTambahan {
  id: string;
  kode: string;
  keterangan: string;
  kodeTransaksi: string;
}

interface KodeTransaksiSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: KeteranganTambahan) => void;
}

export function KodeTransaksiSelector({ 
  open, 
  onOpenChange, 
  onSelect 
}: KodeTransaksiSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch keterangan tambahan
  const { data: items = [], isLoading } = useQuery<KeteranganTambahan[]>({
    queryKey: ['keteranganTambahan', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/keterangan-tambahan${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`)
      if (!response.ok) {
        throw new Error('Failed to fetch keterangan tambahan')
      }
      return response.json()
    },
    enabled: open // Only fetch when dialog is open
  })

  // Filter items based on search term
  const filteredItems = items.filter(item => 
      searchTerm === '' ||
      item.kodeTransaksi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) 
    
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Pilih Kode Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan kode atau keterangan..."
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
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Tidak ada hasil yang sesuai'
                  : 'Tidak ada data'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => {
                    onSelect(item)
                    onOpenChange(false)
                  }}
                >
                  <div>
                    <div className="font-medium">
                    { item.kodeTransaksi} - {item.keterangan}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Kode: {item.kode}
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