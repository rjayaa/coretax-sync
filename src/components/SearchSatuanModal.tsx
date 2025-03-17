'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { SatuanUkur } from '@/types/satuan-ukur';

interface SearchSatuanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SatuanUkur[];
  onSelect: (item: SatuanUkur) => void;
  title?: string;
}

export const SearchSatuanModal: React.FC<SearchSatuanModalProps> = ({
  open,
  onOpenChange,
  items,
  onSelect,
  title = 'Pilih Satuan'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<SatuanUkur[]>(items);

  // Update filtered items when the search term or items change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = items.filter(item => 
        item.id.toLowerCase().includes(lowerSearchTerm) || 
        item.satuan.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  // Reset search on open
  useEffect(() => {
    if (open) {
      setSearchTerm('');
    }
  }, [open]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Cari dan pilih satuan yang sesuai
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search" 
              placeholder="Cari berdasarkan ID atau nama satuan..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="max-h-[300px] overflow-auto border rounded-md">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Tidak ada satuan yang ditemukan
            </div>
          ) : (
            <div className="p-1">
              {filteredItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start text-left mb-1 h-auto py-3"
                  onClick={() => {
                    onSelect(item);
                    onOpenChange(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{item.id} - {item.satuan}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchSatuanModal;