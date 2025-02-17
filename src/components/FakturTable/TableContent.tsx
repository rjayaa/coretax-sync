import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

interface TableContentProps {
  fakturs: any[];
  onViewDetail: (id: string) => void;
}

export const TableContent = ({ fakturs, onViewDetail }: TableContentProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal Faktur</TableHead>
            <TableHead>Jenis Faktur</TableHead>
            <TableHead>Kode Transaksi</TableHead>
            <TableHead>Nama Pembeli</TableHead>
            <TableHead>NPWP/NIK Pembeli</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
          <TableBody>
          {fakturs.map((faktur) => (
            <TableRow key={faktur.id}>  // Menggunakan id
              <TableCell>{new Date(faktur.tanggal_faktur).toLocaleDateString()}</TableCell>
              <TableCell>{faktur.jenis_faktur}</TableCell>
              <TableCell>{faktur.kode_transaksi}</TableCell>
              <TableCell>{faktur.nama_pembeli}</TableCell>
              <TableCell>{faktur.npwp_nik_pembeli}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetail(`/faktur/${faktur.id}`)}  // Menggunakan id
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};