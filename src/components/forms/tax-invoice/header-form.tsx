// src/components/forms/tax-invoice/header-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HeaderData, FakturData } from "@/types/tax-invoice";
import { TRANSACTION_TYPES } from "@/lib/constants/tax-invoice";

interface HeaderFormProps {
  headerData: HeaderData;
  fakturData: FakturData;
  onHeaderChange: (field: keyof HeaderData, value: string) => void;
  onFakturChange: (field: keyof FakturData, value: string) => void;
}

export default function HeaderForm({
    headerData,
    fakturData,
    onHeaderChange,
    onFakturChange,
}: HeaderFormProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>NPWP Penjual</Label>
            <Input 
              value={headerData.npwpPenjual}
              onChange={(e) => onHeaderChange('npwpPenjual', e.target.value)}
              placeholder="Masukkan NPWP Penjual"
            />
          </div>
    
          <div>
            <Label>Jenis Transaksi</Label>
            <Select
              value={headerData.jenisTransaksi}
              onValueChange={(value) => onHeaderChange('jenisTransaksi', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Transaksi" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
    
          {headerData.jenisTransaksi === 'REMAINING_PAYMENT' && (
            <div>
              <Label>Referensi Invoice DP</Label>
              <Input 
                value={fakturData.referensiInvoiceDP}
                onChange={(e) => onFakturChange('referensiInvoiceDP', e.target.value)}
                placeholder="Masukkan Nomor Invoice DP"
              />
            </div>
          )}
    
          <div>
            <Label>Tanggal Faktur</Label>
            <Input 
              type="date"
              value={fakturData.tanggalFaktur}
              onChange={(e) => onFakturChange('tanggalFaktur', e.target.value)}
            />
          </div>
      <div>
        <Label>Kode Transaksi</Label>
        <Input 
          value={fakturData.kodeTransaksi}
          onChange={(e) => onFakturChange('kodeTransaksi', e.target.value)}
          placeholder="Masukkan Kode Transaksi"
        />
      </div>
      <div>
        <Label>NPWP/NIK Pembeli</Label>
        <Input 
          value={fakturData.npwpPembeli}
          onChange={(e) => onFakturChange('npwpPembeli', e.target.value)}
          placeholder="Masukkan NPWP/NIK Pembeli"
        />
      </div>
      <div>
        <Label>Nama Pembeli</Label>
        <Input 
          value={fakturData.namaPembeli}
          onChange={(e) => onFakturChange('namaPembeli', e.target.value)}
          placeholder="Masukkan Nama Pembeli"
        />
      </div>
      <div>
        <Label>Alamat Pembeli</Label>
        <Input 
          value={fakturData.alamatPembeli}
          onChange={(e) => onFakturChange('alamatPembeli', e.target.value)}
          placeholder="Masukkan Alamat Pembeli"
        />
      </div>
      <div>
        <Label>Email Pembeli</Label>
        <Input 
          type="email"
          value={fakturData.emailPembeli}
          onChange={(e) => onFakturChange('emailPembeli', e.target.value)}
          placeholder="Masukkan Email Pembeli"
        />
      </div>
      <div>
        <Label>Referensi</Label>
        <Input 
          value={fakturData.referensi}
          onChange={(e) => onFakturChange('referensi', e.target.value)}
          placeholder="Masukkan Referensi"
        />
      </div>
    </div>
  );
}