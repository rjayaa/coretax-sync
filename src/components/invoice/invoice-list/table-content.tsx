// src/components/invoice/table-content.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Invoice } from "@/hooks/use-invoice";
import { Button } from "@/components/ui/button";

interface TableContentProps {
    invoices: Invoice[];
    onViewDetail: (id: string) => void;
}

export const TableContent = ({ invoices, onViewDetail }: TableContentProps) => {
  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nomor Faktur</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>NPWP</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>DPP</TableHead>
            <TableHead>PPN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{new Date(invoice.date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.customer}</TableCell>
              <TableCell>{invoice.npwp}</TableCell>
              <TableCell>{invoice.type}</TableCell>
              <TableCell>{formatCurrency(invoice.dpp)}</TableCell>
              <TableCell>{formatCurrency(invoice.ppn)}</TableCell>
              <TableCell>{invoice.status}</TableCell>
            <TableCell>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(invoice.id)}
                >
                    Detail
                </Button>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};