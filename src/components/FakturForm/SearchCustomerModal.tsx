'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { MasterDataCustomer } from '@/types/customer';

interface CustomerSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: MasterDataCustomer[];
  onSelect: (customer: MasterDataCustomer) => void;
}

export function CustomerSearchModal({ open, onOpenChange, customers = [], onSelect }: CustomerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<MasterDataCustomer[]>([]);

  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }

    const filtered = customers.filter(customer => 
      customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.npwp.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const formatAddress = (customer: MasterDataCustomer) => {
    const parts = [
      customer.jalan,
      customer.blok && `Blok ${customer.blok}`,
      customer.nomor && `No. ${customer.nomor}`,
      customer.rt && `RT ${customer.rt}`,
      customer.rw && `RW ${customer.rw}`,
      customer.kelurahan,
      customer.kecamatan,
      customer.kabupaten,
      customer.propinsi,
      customer.kode_pos
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Pilih Pembeli</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama atau NPWP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-2 py-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group hover:bg-accent rounded-lg transition-colors"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-4 px-4"
                  onClick={() => {
                    onSelect(customer);
                    onOpenChange(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{customer.nama}</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {customer.npwp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formatAddress(customer)}
                    </p>
                    {customer.nomor_telepon && (
                      <p className="text-sm text-muted-foreground">
                        Tel: {customer.nomor_telepon}
                      </p>
                    )}
                  </div>
                </Button>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada hasil yang ditemukan
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}