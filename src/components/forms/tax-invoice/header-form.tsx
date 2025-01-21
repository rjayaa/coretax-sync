// src/components/forms/tax-invoice/header-form.tsx
"use client";

import { useEffect, useState } from "react";
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

interface Customer {
  id: string;
  nama: string;
  npwp: string;
  jalan: string | null;
  alamatLengkap: string;
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/customers');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.customers) {
          console.log('Loaded customers:', data.customers.length);
          setCustomers(data.customers);
        } else {
          console.warn('No customers data in response:', data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      onFakturChange('npwpPembeli', selectedCustomer.npwp);
      onFakturChange('namaPembeli', selectedCustomer.nama);
      onFakturChange('alamatPembeli', selectedCustomer.alamatLengkap);
    }
  };

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

          <div>
            <Label>Pilih Customer</Label>
            <Select
              onValueChange={handleCustomerChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Pilih Customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.nama} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>NPWP Pembeli</Label>
            <Input 
              value={fakturData.npwpPembeli}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label>Nama Pembeli</Label>
            <Input 
              value={fakturData.namaPembeli}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label>Alamat Pembeli</Label>
            <Input 
              value={fakturData.alamatPembeli}
              readOnly
              className="bg-gray-50"
            />
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