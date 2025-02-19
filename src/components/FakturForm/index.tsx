'use client';
// components/FakturForm/index.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './FormField';
import { FakturData } from '@/types/faktur';
import { validateFakturData } from '@/utils/validation';
import { INITIAL_FAKTUR_STATE } from '@/constants/faktur';
import { Label } from '../ui/label';

interface FakturFormProps {
  initialData?: FakturData;
  isEdit?: boolean;
  onSubmit: (data: FakturData) => void;
}

const FakturForm = ({ onSubmit }: FakturFormProps) => {
  const [fakturData, setFakturData] = useState<FakturData>(INITIAL_FAKTUR_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FakturData, string>>>({});


useEffect(() => {
    const selectedCompanyStr = localStorage.getItem('selectedCompany');
    if (selectedCompanyStr) {
      const selectedCompany = JSON.parse(selectedCompanyStr);
      setFakturData(prev => ({ 
        ...prev, 
        npwp_penjual: selectedCompany.npwp_company || ''
      }));
    }
  }, []); // Add empty dependency array here
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateFakturData(fakturData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        ...fakturData,
        id: Math.random().toString(36).substr(2, 9)
      });
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFakturData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FakturData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFakturData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Input Faktur</CardTitle>
      </CardHeader>
      <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
            id="npwp_penjual"
            label="NPWP Penjual"
            value={fakturData.npwp_penjual}
            onChange={handleChange}
            error={errors.npwp_penjual}
            required
            readOnly={true}
          />
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="tanggal_faktur"
              label="Tanggal Faktur"
              type="date"
              value={fakturData.tanggal_faktur}
              onChange={handleChange}
              error={errors.tanggal_faktur}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="jenis_faktur">Jenis Faktur</Label>
              <Select
                value={fakturData.jenis_faktur}
                onValueChange={(value) => handleSelectChange('jenis_faktur', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis faktur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Pengganti">Pengganti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="kode_transaksi"
              label="Kode Transaksi"
              value={fakturData.kode_transaksi}
              onChange={handleChange}
              error={errors.kode_transaksi}
              required
              maxLength={2}
            />

            <FormField
              id="keterangan_tambahan"
              label="Keterangan Tambahan"
              value={fakturData.keterangan_tambahan}
              onChange={handleChange}
              maxLength={20}
            />
          </div>

          {/* Supporting Documents */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="dokumen_pendukung"
              label="Dokumen Pendukung"
              value={fakturData.dokumen_pendukung}
              onChange={handleChange}
            />

            <FormField
              id="referensi"
              label="Referensi"
              value={fakturData.referensi}
              onChange={handleChange}
            />
          </div>

          {/* Facility and Seller Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="cap_fasilitas"
              label="Cap Fasilitas"
              value={fakturData.cap_fasilitas}
              onChange={handleChange}
            />

            <FormField
              id="id_tku_penjual"
              label="ID TKU Penjual"
              value={fakturData.id_tku_penjual}
              onChange={handleChange}
              error={errors.id_tku_penjual}
              required
            />
          </div>

          {/* Buyer Identification */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="npwp_nik_pembeli"
              label="NPWP/NIK Pembeli"
              value={fakturData.npwp_nik_pembeli}
              onChange={handleChange}
              error={errors.npwp_nik_pembeli}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="jenis_id_pembeli">Jenis ID Pembeli</Label>
              <Select
                value={fakturData.jenis_id_pembeli}
                onValueChange={(value) => handleSelectChange('jenis_id_pembeli', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TIN">TIN</SelectItem>
                  <SelectItem value="LAINNYA">LAINNYA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buyer Country and Document */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="negara_pembeli"
              label="Negara Pembeli"
              value={fakturData.negara_pembeli}
              onChange={handleChange}
              placeholder="IDN"
              maxLength={3}
            />

            <FormField
              id="nomor_dokumen_pembeli"
              label="Nomor Dokumen Pembeli"
              value={fakturData.nomor_dokumen_pembeli}
              onChange={handleChange}
            />
          </div>

          {/* Buyer Details */}
          <FormField
            id="nama_pembeli"
            label="Nama Pembeli"
            value={fakturData.nama_pembeli}
            onChange={handleChange}
            error={errors.nama_pembeli}
            required
          />

          <FormField
            id="alamat_pembeli"
            label="Alamat Pembeli"
            value={fakturData.alamat_pembeli}
            onChange={handleChange}
            error={errors.alamat_pembeli}
            required
          />

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="email_pembeli"
              label="Email Pembeli"
              required
              value={fakturData.email_pembeli}
              onChange={handleChange}
            />

            <FormField
              id="id_tku_pembeli"
              label="ID TKU Pembeli"
              value={fakturData.id_tku_pembeli}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full">
            Simpan Faktur
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FakturForm;