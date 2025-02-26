'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { formatCurrency } from '@/lib/utils/formatter';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface DetailListProps {
  details: DetailFakturData[];
  faktur: FakturData & { id: string };
  isEditable?: boolean;
  onRefresh?: () => void;
}

export const DetailList: React.FC<DetailListProps> = ({ 
  details, 
  faktur, 
  isEditable = false,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  
  // Calculate totals
  const totalDPP = details.reduce((sum, detail) => sum + parseFloat(detail.dpp || '0'), 0);
  const totalPPN = details.reduce((sum, detail) => sum + parseFloat(detail.ppn || '0'), 0);
  const totalPPNBM = details.reduce((sum, detail) => sum + parseFloat(detail.ppnbm || '0'), 0);
  const grandTotal = totalDPP + totalPPN + totalPPNBM;

  const handleDeleteClick = (detailId: string) => {
    setSelectedDetailId(detailId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDetailId) return;
    
    try {
      await FakturService.deleteDetailFaktur(selectedDetailId);
      toast({
        title: 'Berhasil',
        description: 'Detail faktur berhasil dihapus',
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus detail faktur',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDetailId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Barang/Jasa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Barang/Jasa</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Diskon</TableHead>
                <TableHead className="text-right">DPP</TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead className="text-right">PPnBM</TableHead>
                {isEditable && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail, index) => (
                <TableRow key={detail.id_detail_faktur || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {detail.kode_barang_or_jasa || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={detail.nama_barang_or_jasa}>
                      {detail.nama_barang_or_jasa}
                    </div>
                  </TableCell>
                  <TableCell>{detail.nama_satuan_ukur}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(detail.harga_satuan)}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.barang_or_jasa === 'a' 
                      ? detail.jumlah_barang 
                      : detail.jumlah_jasa}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.total_diskon ? `${detail.total_diskon}%` : '0%'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(detail.dpp)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(detail.ppn)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(detail.ppnbm)}
                  </TableCell>
                  {isEditable && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit detail"
                          onClick={() => {
                            // Handle edit action
                            toast({
                              title: 'Info',
                              description: 'Fitur edit detail akan segera tersedia',
                            });
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Hapus detail"
                          onClick={() => handleDeleteClick(detail.id_detail_faktur)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              
              {/* Summary row */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={7} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalDPP)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalPPN)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalPPNBM)}
                </TableCell>
                {isEditable && <TableCell />}
              </TableRow>
              
              {/* Grand total row */}
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={7} className="text-right">
                  Grand Total
                </TableCell>
                <TableCell colSpan={3} className="text-right">
                  {formatCurrency(grandTotal)}
                </TableCell>
                {isEditable && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Detail Faktur?</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus detail faktur ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};