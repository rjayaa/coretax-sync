'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Item {
  id: string;
  english: string;
  bahasa: string;
  goods_services: string;
  kode_barang?: string;
  kode_jasa?: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Item[];
  onSelect: (item: Item) => void;
  title: string;
  searchByCode?: boolean;
}

export function SearchModal({ 
  open, 
  onOpenChange, 
  items, 
  onSelect, 
  title,
  searchByCode = false
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = items.filter(item => {
      // Log the item properties to debug
      console.log('Item being filtered:', item, 
                  'has kode_barang:', item.kode_barang, 
                  'has kode_jasa:', item.kode_jasa);
      
      // Prioritas pencarian berdasarkan kode
      const kodeMatch = 
        (item.kode_barang && item.kode_barang.toLowerCase().includes(lowerCaseSearch)) ||
        (item.kode_jasa && item.kode_jasa.toLowerCase().includes(lowerCaseSearch));
      
      if (searchByCode && kodeMatch) return true;
      
      // Pencarian berdasarkan nama/deskripsi
      return (
        item.english.toLowerCase().includes(lowerCaseSearch) ||
        item.bahasa.toLowerCase().includes(lowerCaseSearch) ||
        item.goods_services.toLowerCase().includes(lowerCaseSearch)
      );
    });
    
    setFilteredItems(filtered);
  }, [searchTerm, items, searchByCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchByCode ? "Cari berdasarkan kode..." : "Cari berdasarkan nama atau kode..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-2 py-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group hover:bg-accent rounded-lg transition-colors"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-4 px-4"
                  onClick={() => {
                    onSelect(item);
                    onOpenChange(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex gap-4 w-full">
                    <div className="shrink-0 flex items-start pt-1">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm whitespace-nowrap font-medium">
                        {item.kode_barang || item.kode_jasa || item.goods_services}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          <div className="line-clamp-2 hover:line-clamp-none transition-all">
                            {item.bahasa}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="line-clamp-2 hover:line-clamp-none transition-all">
                            {item.english}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            ))}
            {filteredItems.length === 0 && (
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