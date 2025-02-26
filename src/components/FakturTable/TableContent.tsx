'use client';

import React, { useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FakturData } from '@/types/faktur';
import { Pencil, Eye, AlertCircle, Loader2, Info, Trash2 } from 'lucide-react';
import { formatDate, formatNPWP } from '@/lib/utils/formatter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TableContentProps {
  fakturs: (FakturData & { id: string })[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  onSelect: (id: string, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TableContent: React.FC<TableContentProps> = ({
  fakturs,
  loading,
  error,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete
}) => {
  // Calculate if all items are selected
  const allSelected = fakturs.length > 0 && fakturs.every(faktur => selectedIds.has(faktur.id));
  // Calculate if some items are selected
  const someSelected = !allSelected && fakturs.some(faktur => selectedIds.has(faktur.id));
  
  // Reset selection when fakturs change
  useEffect(() => {
    // Optional: reset selection when fakturs list changes completely
    // This is usually helpful when switching pages or applying filters
    // onSelectAll(false);
  }, [fakturs]);

  // Empty state
  if (!loading && !error && fakturs.length === 0) {
    return (
      <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Info className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium mb-1">Tidak ada data faktur</h3>
        <p className="text-sm text-muted-foreground mb-3 max-w-md">
          Belum ada faktur pajak yang dibuat atau data tidak ditemukan dengan filter yang dipilih.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="border rounded-md p-6 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Memuat data faktur...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-6 w-6 text-destructive mb-3" />
        <h3 className="text-base font-medium mb-1">Gagal memuat data</h3>
        <p className="text-sm text-muted-foreground mb-3">{error}</p>
      </div>
    );
  }

  // Render table with data
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={allSelected} 
                // @ts-ignore - tailwind-ui checkbox has indeterminate prop
                indeterminate={someSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-[90px]">Tanggal</TableHead>
            <TableHead>Pembeli</TableHead>
            <TableHead className="w-[140px]">NPWP</TableHead>
            <TableHead className="w-[90px]">Kode</TableHead>
            <TableHead className="w-[90px]">Status</TableHead>
            <TableHead className="w-[100px] text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fakturs.map((faktur) => (
            <TableRow 
              key={faktur.id} 
              className={`hover:bg-muted/30 ${
                selectedIds.has(faktur.id) ? 'bg-muted/30' : ''
              }`}
            >
              <TableCell className="py-2">
                <Checkbox 
                  checked={selectedIds.has(faktur.id)}
                  onCheckedChange={(checked) => onSelect(faktur.id, !!checked)}
                  aria-label={`Select faktur ${faktur.id}`}
                />
              </TableCell>
              <TableCell className="py-2 font-medium">
                {formatDate(faktur.tanggal_faktur)}
              </TableCell>
              <TableCell className="py-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="max-w-[180px] truncate cursor-help">
                        {faktur.nama_pembeli}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{faktur.nama_pembeli}</p>
                        <p className="text-xs">{faktur.alamat_pembeli}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="py-2 font-mono text-xs">
                {formatNPWP(faktur.npwp_nik_pembeli)}
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {faktur.kode_transaksi}
                </Badge>
              </TableCell>
              <TableCell className="py-2">
                <Badge variant={getFakturStatusVariant(faktur.jenis_faktur)}>
                  {faktur.jenis_faktur}
                </Badge>
              </TableCell>
              <TableCell className="py-1 text-right">
                <div className="flex justify-end space-x-1">
                  {/* <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(faktur.id)} 
                    title="Lihat detail"
                    className="h-7 w-7"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button> */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(faktur.id)} 
                    title="Edit faktur"
                    className="h-7 w-7"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm('Apakah Anda yakin ingin menghapus faktur ini?')) {
                          onDelete(faktur.id);
                        }
                      }}
                      title="Hapus faktur" 
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper function to determine badge variant based on faktur status/type
function getFakturStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'Normal':
      return 'default';
    case 'Pengganti':
      return 'secondary';
    case 'Batal':
      return 'destructive';
    default:
      return 'outline';
  }
}