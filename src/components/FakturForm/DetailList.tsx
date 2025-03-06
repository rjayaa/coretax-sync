'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { formatCurrency, formatDate, getMonth, getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DetailListProps {
  details: DetailFakturData[];
  faktur: FakturData & { id: string };
  onDelete?: (id: string) => void;
  onEdit?: (detail: DetailFakturData) => void;
  editingId?: string;
}

export const DetailList: React.FC<DetailListProps> = ({
  details,
  faktur,
  onDelete,
  onEdit,
  editingId
}) => {
  if (!details || details.length === 0) {
    return null;
  }

  // Calculate total values
  const totalDPP = details.reduce((sum, detail) => sum + parseFloat(detail.dpp || '0'), 0);
  const totalPPN = details.reduce((sum, detail) => sum + parseFloat(detail.ppn || '0'), 0);
  const totalPPnBM = details.reduce((sum, detail) => sum + parseFloat(detail.ppnbm || '0'), 0);
  const totalDPPNilaiLain = details.reduce((sum, detail) => sum + parseFloat(detail.dpp_nilai_lain || '0'), 0);
  const grandTotal = totalDPP + totalPPN + totalPPnBM + totalDPPNilaiLain;

  const getTypeDisplay = (type: string) => {
    // Transform values for display purposes
    // "b" should display as "GOODS" and "j" should display as "SERVICES"
    // In your case, if actual values are "a" and "b", we map them accordingly
    if (type === 'a') return 'GOODS';
    if (type === 'b') return 'SERVICES';
    return type.toUpperCase(); // Default to uppercase for any other value
  };

  // Calculate total harga for each item (harga_satuan * jumlah_barang_jasa)
  const calculateTotalHarga = (detail: DetailFakturData) => {
    const hargaSatuan = parseFloat(detail.harga_satuan || '0');
    const jumlah = parseFloat(detail.jumlah_barang_jasa || '0');
    return hargaSatuan * jumlah;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Detail Faktur</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Invoice Header Information */}
        <div className="p-4 mb-4 bg-muted/30 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Informasi Pembeli</h3>
              <p className="font-medium">{faktur.nama_pembeli}</p>
              <p className="text-sm">NPWP: {faktur.npwp_nik_pembeli}</p>
              <p className="text-sm">Alamat: {faktur.alamat_pembeli || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Informasi Faktur</h3>
              <p className="text-sm">No. Faktur: {faktur.nomor_faktur_pajak}</p>
              <p className="text-sm">Tanggal: {formatDate(faktur.tanggal_faktur)}</p>
              <p className="text-sm">Masa Pajak: {getMonth(faktur.tanggal_faktur)} {getYear(faktur.tanggal_faktur)}</p>
              <p className="text-sm">Kode Transaksi: {faktur.kode_transaksi}</p>
              <p className="text-sm mt-1">
                <Badge 
                  variant={faktur.status_faktur === 'APPROVED' ? "success" : 
                          faktur.status_faktur === 'PENDING' ? "warning" : "default"}
                >
                  {faktur.status_faktur}
                </Badge>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nilai Faktur</h3>
              <p className="text-sm">Harga Jual/DPP: {formatCurrency(totalDPP)}</p>
              <p className="text-sm">DPP Nilai Lain: {formatCurrency(totalDPPNilaiLain)}</p>
              <p className="text-sm">PPN: {formatCurrency(totalPPN)}</p>
              <p className="text-sm">PPnBM: {formatCurrency(totalPPnBM)}</p>
              <p className="text-sm font-bold mt-1">Total: {formatCurrency(grandTotal)}</p>
            </div>
          </div>
          {faktur.referensi && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-muted-foreground">Referensi</h3>
              <p className="text-sm">{faktur.referensi}</p>
            </div>
          )}
        </div>
        
        {/* Items Table */}
        <div className="overflow-x-auto">
          <Table className='min-w-max'>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tipe</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>KUANTITAS</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead>Potongan Harga</TableHead>
                <TableHead>DPP</TableHead>
                <TableHead>PPN</TableHead>
                <TableHead>DPP Nilai Lain</TableHead>
                <TableHead>PPnBM</TableHead>
                <TableHead>Tarif PPnBM</TableHead>
                {(onDelete || onEdit) && <TableHead className="w-[100px]">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail) => (
                <TableRow 
                  key={detail.id_detail_faktur} 
                  className={editingId === detail.id_detail_faktur 
                    ? "bg-primary/10" 
                    : "hover:bg-muted/50"
                  }
                >
                  <TableCell>
                    {/* Transform value only for display purposes */}
                    {getTypeDisplay(detail.barang_or_jasa)}
                  </TableCell>
                  <TableCell className="font-medium">{detail.nama_barang_or_jasa}</TableCell>
                  <TableCell>{detail.kode_barang_or_jasa || '-'}</TableCell>
                  <TableCell className="text-right">{detail.jumlah_barang_jasa}</TableCell>
                  <TableCell>{detail.nama_satuan_ukur}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.harga_satuan || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateTotalHarga(detail))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.total_diskon || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.dpp || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.ppn || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.dpp_nilai_lain || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.ppnbm || '0'))}
                  </TableCell>
                  <TableCell className="text-right">{detail.tarif_ppnbm || '0'}%</TableCell>
                  {(onDelete || onEdit) && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {onEdit && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => onEdit(detail)}
                            aria-label="Edit item"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                            onClick={() => {
                              if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
                                onDelete(detail.id_detail_faktur);
                              }
                            }}
                            aria-label="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              
              {/* Summary row */}
              <TableRow className="bg-muted/30 font-medium">
                <TableCell colSpan={8} className="text-right">Total:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDPP)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalPPN)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDPPNilaiLain)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalPPnBM)}</TableCell>
                <TableCell></TableCell>
                {(onDelete || onEdit) && <TableCell></TableCell>}
              </TableRow>
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={8} className="text-right">Grand Total:</TableCell>
                <TableCell colSpan={5} className="text-right">{formatCurrency(grandTotal)}</TableCell>
                {(onDelete || onEdit) && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};