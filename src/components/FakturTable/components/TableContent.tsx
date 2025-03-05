import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, getMonth, getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Extended interface to include faktur details
interface FakturWithDetails extends FakturData {
  id: string;
  details?: DetailFakturData[];
}

interface TableContentProps {
  fakturs: FakturWithDetails[];
  loading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEdit: (id: string) => void;
}

export const TableContent: React.FC<TableContentProps> = ({
  fakturs,
  loading,
  error,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit
}) => {
  // Calculate "all selected" state
  const allSelected = fakturs.length > 0 && fakturs.every(faktur => selectedIds.has(faktur.id));
  const someSelected = fakturs.length > 0 && fakturs.some(faktur => selectedIds.has(faktur.id)) && !allSelected;

  // Function to calculate total PPN from details
  const calculateTotalPPN = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const ppn = parseFloat(detail.ppn || '0');
      return sum + (isNaN(ppn) ? 0 : ppn);
    }, 0);
  };

  // Function to calculate total DPP from details
  const calculateTotalDPP = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const dpp = parseFloat(detail.dpp || '0');
      return sum + (isNaN(dpp) ? 0 : dpp);
    }, 0);
  };

  // Function to calculate total DPP Nilai Lain from details
  const calculateTotalDPPNilaiLain = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const dppNilaiLain = parseFloat(detail.dpp_nilai_lain || '0');
      return sum + (isNaN(dppNilaiLain) ? 0 : dppNilaiLain);
    }, 0);
  };

  // Function to calculate total PPNBM from details
  const calculateTotalPPNBM = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const ppnbm = parseFloat(detail.ppnbm || '0');
      return sum + (isNaN(ppnbm) ? 0 : ppnbm);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Memuat data faktur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (fakturs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">Tidak ada data faktur yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox 
                checked={allSelected} 
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>NPWP Pembeli</TableHead>
            <TableHead>Nama Pembeli</TableHead>
            <TableHead>Kode Transaksi</TableHead>
            <TableHead>Nomor Faktur Pajak</TableHead>
            <TableHead>Tanggal Faktur Pajak</TableHead>
            <TableHead>Masa Pajak</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Status Faktur</TableHead>
            <TableHead className="text-right">Harga Jual/Penggantian/DPP</TableHead>
            <TableHead className="text-right">DPP Nilai Lain</TableHead>
            <TableHead className="text-right">PPN</TableHead>
            <TableHead className="text-right">PPnBM</TableHead>
            <TableHead>Referensi</TableHead>
            <TableHead className="w-10">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fakturs.map((faktur) => (
            <TableRow 
              key={`faktur-${faktur.id}`}
              className={cn(
                selectedIds.has(faktur.id) ? "bg-muted/50" : "",
                "font-medium"
              )}
            >
              <TableCell>
                <Checkbox 
                  checked={selectedIds.has(faktur.id)}
                  onCheckedChange={(checked) => onSelect(faktur.id, !!checked)}
                  aria-label={`Select faktur ${faktur.id}`}
                />
              </TableCell>
              <TableCell>{faktur.npwp_nik_pembeli}</TableCell>
              <TableCell>{faktur.nama_pembeli}</TableCell>
              <TableCell>{faktur.kode_transaksi}</TableCell>
              <TableCell>{faktur.nomor_faktur_pajak}</TableCell>
              <TableCell>{formatDate(faktur.tanggal_faktur)}</TableCell>
              <TableCell>{getMonth(faktur.tanggal_faktur)}</TableCell>
              <TableCell>{getYear(faktur.tanggal_faktur)}</TableCell>
              <TableCell>
                <Badge 
                  variant={faktur.status_faktur === 'APPROVED' ? "success" : 
                          faktur.status_faktur === 'PENDING' ? "warning" : "default"}
                >
                  {faktur.status_faktur}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateTotalDPP(faktur.details))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateTotalDPPNilaiLain(faktur.details))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateTotalPPN(faktur.details))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateTotalPPNBM(faktur.details))}
              </TableCell>
              <TableCell>{faktur.referensi}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(faktur.id)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};