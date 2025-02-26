
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
import { formatCurrency } from '@/lib/utils/formatter';
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
  const grandTotal = totalDPP + totalPPN + totalPPnBM;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Daftar Item</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px]">Nama Barang/Jasa</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">DPP</TableHead>
                <TableHead className="text-right">PPN</TableHead>
                <TableHead className="text-right">PPnBM</TableHead>
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
                  <TableCell className="font-medium">
                    {detail.nama_barang_or_jasa}
                    <div className="text-xs text-muted-foreground">
                      Kode: {detail.kode_barang_or_jasa || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {detail.jumlah_barang_jasa} {detail.nama_satuan_ukur}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.harga_satuan || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.dpp || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.ppn || '0'))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(detail.ppnbm || '0'))}
                  </TableCell>
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
                <TableCell colSpan={3} className="text-right">Total:</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDPP)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalPPN)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalPPnBM)}</TableCell>
                {(onDelete || onEdit) && <TableCell></TableCell>}
              </TableRow>
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={3} className="text-right">Grand Total:</TableCell>
                <TableCell colSpan={3} className="text-right">{formatCurrency(grandTotal)}</TableCell>
                {(onDelete || onEdit) && <TableCell></TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};