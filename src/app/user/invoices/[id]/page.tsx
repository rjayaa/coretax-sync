// src/app/user/invoices/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation';
import { useInvoiceDetail } from '@/hooks/use-invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data, isLoading, error } = useInvoiceDetail(params.id as string);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  const invoice = data?.data;
  if (!invoice) return null;
  const dppTotal = Number(invoice.dppTotal);
  const ppnTotal = Number(invoice.ppnTotal);
  const ppnbmTotal = Number(invoice.ppnbmTotal);
  const grandTotal = dppTotal + ppnTotal + ppnbmTotal;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detail Faktur</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Faktur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nomor Faktur</p>
              <p className="font-medium">{invoice.nomorFaktur}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Faktur</p>
              <p className="font-medium">
                {new Date(invoice.tanggalFaktur).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jenis Faktur</p>
              <p className="font-medium">{invoice.jenisFaktur}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{invoice.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pembeli</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Pembeli</p>
              <p className="font-medium">{invoice.namaPembeli}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NPWP</p>
              <p className="font-medium">{invoice.npwpPembeli}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Alamat</p>
              <p className="font-medium">{invoice.alamatPembeli}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{invoice.emailPembeli || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Barang/Jasa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Barang/Jasa</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Total</TableHead>
                <TableHead className="text-right">Diskon</TableHead>
                <TableHead className="text-right">DPP</TableHead>
                <TableHead className="text-right">PPN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.details.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>{detail.nomorUrut}</TableCell>
                  <TableCell>{detail.namaBarangJasa}</TableCell>
                  <TableCell>{detail.kodeBarangJasa}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(detail.hargaSatuan))}</TableCell>
                  <TableCell className="text-right">{Number(detail.jumlah).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(detail.hargaTotal))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(detail.diskon))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(detail.dpp))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(detail.ppn))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>Total DPP</span>
                <span className="font-medium">{formatCurrency(dppTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total PPN</span>
                <span className="font-medium">{formatCurrency(ppnTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total PPnBM</span>
                <span className="font-medium">{formatCurrency(ppnbmTotal)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}