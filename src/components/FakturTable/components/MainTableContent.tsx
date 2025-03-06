import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, getMonth, getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Extended interface to include faktur details
interface FakturWithDetails extends FakturData {
  id: string;
  details?: DetailFakturData[];
}

interface MainTableContentProps {
  fakturs: FakturWithDetails[];
  loading: boolean;
  error: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const MainTableContent: React.FC<MainTableContentProps> = ({
  fakturs,
  loading,
  error,
  onEdit,
  onDelete
}) => {
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
    <div className="border rounded-md overflow-x-auto">
      <Table className='min-w-max'>
        <TableHeader>
          <TableRow>
            <TableHead>NPWP Pembeli</TableHead>
            <TableHead>Nama Pembeli</TableHead>
            <TableHead>Kode Transaksi</TableHead>
            <TableHead>Nomor Faktur Pajak</TableHead>
            <TableHead>Tanggal Faktur Pajak</TableHead>
            <TableHead>Masa Pajak</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Status Faktur</TableHead>
            <TableHead >Harga Jual/DPP</TableHead>
            <TableHead >DPP Nilai Lain</TableHead>
            <TableHead >PPN</TableHead>
            <TableHead >PPnBM</TableHead>
            <TableHead>Referensi</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fakturs.map((faktur) => (
            <TableRow 
              key={`faktur-${faktur.id}`}
              className="font-medium"
            >
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
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(faktur.id)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus Faktur</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => onDelete(faktur.id)}
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};