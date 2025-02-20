
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './FormField';
import { FakturData } from '@/types/faktur';
import { validateFakturData } from '@/lib/utils/validation';
import { INITIAL_FAKTUR_STATE } from '@/constants/faktur';
import { Label } from '../ui/label';
import { SelectField } from './SelectField';
import { useKodeTransaksi } from '@/hooks/use-kode-transaksi';
import { useCapFasilitas } from '@/hooks/use-cap-fasilitas';
import { useKeteranganTambahan } from '@/hooks/use-keterangan-tambahan';
import { useMasterCustomer } from '@/hooks/use-master-customer';
import { Search } from 'lucide-react';
import { CustomerSearchModal } from './SearchCustomerModal';
import { Textarea } from '@/components/ui/textarea';

interface FakturFormProps {
  initialData?: FakturData;
  isEdit?: boolean;
  onSubmit: (data: FakturData) => void;
}

const FakturForm = ({ onSubmit }: FakturFormProps) => {
  const [fakturData, setFakturData] = useState<FakturData>(INITIAL_FAKTUR_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FakturData, string>>>({});
  const { data: kodeTransaksiList = [], isLoading: isLoadingKodeTransaksi } = useKodeTransaksi();
  const { data: keteranganTambahanList = [], isLoading: isLoadingKeteranganTambahan } = useKeteranganTambahan(fakturData.kode_transaksi);
  const { data: capFasilitasList = [], isLoading: isLoadingCapFasilitas } = useCapFasilitas(fakturData.kode_transaksi);
  const { data: customerList = [], isLoading: isLoadingCustomers } = useMasterCustomer();
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  useEffect(() => {
    const selectedCompanyStr = localStorage.getItem('selectedCompany');
    if (selectedCompanyStr) {
      const selectedCompany = JSON.parse(selectedCompanyStr);
      const npwpPenjual = selectedCompany.npwp_company || '';
      setFakturData(prev => ({
        ...prev,
        npwp_penjual: npwpPenjual,
        id_tku_penjual: npwpPenjual ? `${npwpPenjual}000000` : ''
      }));
    }
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFakturData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'npwp_penjual') {
        newData.id_tku_penjual = value ? `${value}000000` : '';
      }
      if (name === 'npwp_nik_pembeli') {
        newData.id_tku_pembeli = value ? `${value}000000` : '';
      }
      return newData;
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFakturData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatAddress = (customer: typeof customerList[0]) => {
    const parts = [
      customer.jalan,
      customer.blok && `Blok ${customer.blok}`,
      customer.nomor && `No. ${customer.nomor}`,
      customer.rt && `RT ${customer.rt}`,
      customer.rw && `RW ${customer.rw}`,
      customer.kelurahan,
      customer.kecamatan,
      customer.kabupaten,
      customer.propinsi,
      customer.kode_pos
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Input Faktur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seller Information */}
          <div className="space-y-4 pb-6 border-b">
            <h2 className="text-lg font-semibold">Data Penjual</h2>
            <FormField
              id="npwp_penjual"
              label="NPWP Penjual"
              value={fakturData.npwp_penjual}
              onChange={handleChange}
              error={errors.npwp_penjual}
              required
              readOnly
            />

            <FormField
              id="id_tku_penjual"
              label="ID TKU Penjual"
              value={fakturData.id_tku_penjual}
              onChange={handleChange}
              error={errors.id_tku_penjual}
              required
              readOnly
            />

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
          </div>

          {/* Buyer Selection and Information */}
          <div className="space-y-4 pb-6 border-b">
            <h2 className="text-lg font-semibold">Data Pembeli</h2>
            <div className="space-y-2">
              <Label>Pilih Pembeli</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setCustomerSearchOpen(true)}
                disabled={isLoadingCustomers}
              >
                {fakturData.nama_pembeli ? (
                  <span className="truncate">{fakturData.nama_pembeli}</span>
                ) : (
                  <span className="text-muted-foreground">Pilih Pembeli</span>
                )}
                <Search className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <CustomerSearchModal
              open={customerSearchOpen}
              onOpenChange={setCustomerSearchOpen}
              customers={customerList}
              onSelect={(customer) => {
                setFakturData(prev => ({
                  ...prev,
                  npwp_nik_pembeli: customer.npwp,
                  nama_pembeli: customer.nama,
                  alamat_pembeli: formatAddress(customer),
                  id_tku_pembeli: `${customer.npwp}000000`,
                  nomor_telepon_pembeli: customer.nomor_telepon
                }));
              }}
            />

            <FormField
              id="npwp_nik_pembeli"
              label="NPWP/NIK Pembeli"
              value={fakturData.npwp_nik_pembeli}
              onChange={handleChange}
              error={errors.npwp_nik_pembeli}
              required
              readOnly
            />

            <FormField
              id="nama_pembeli"
              label="Nama Pembeli"
              value={fakturData.nama_pembeli}
              onChange={handleChange}
              error={errors.nama_pembeli}
              required
              readOnly
            />

            <div className="space-y-2">
              <Label htmlFor="alamat_pembeli">
                Alamat Pembeli
                {errors.alamat_pembeli && (
                  <span className="text-sm text-red-500 ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="alamat_pembeli"
                name="alamat_pembeli"
                value={fakturData.alamat_pembeli}
                onChange={handleChange}
                className={`min-h-[100px] ${errors.alamat_pembeli ? 'border-red-500' : ''}`}
              />
              {errors.alamat_pembeli && (
                <p className="text-sm text-red-500">{errors.alamat_pembeli}</p>
              )}
            </div>

            <FormField
              id="id_tku_pembeli"
              label="ID TKU Pembeli"
              value={fakturData.id_tku_pembeli}
              onChange={handleChange}
            />
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detail Transaksi</h2>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                id="kode_transaksi"
                label="Kode Transaksi"
                value={fakturData.kode_transaksi}
                onChange={(value) => handleSelectChange('kode_transaksi', value)}
                error={errors.kode_transaksi}
                required
                disabled={isLoadingKodeTransaksi}
                options={kodeTransaksiList.map(kt => ({
                  value: kt.kode,
                  label: `${kt.keterangan}`
                }))}
                placeholder="Pilih kode transaksi"
              />

              <SelectField
                id="keterangan_tambahan"
                label="Keterangan Tambahan"
                value={fakturData.keterangan_tambahan}
                onChange={(value) => handleSelectChange('keterangan_tambahan', value)}
                error={errors.keterangan_tambahan}
                disabled={isLoadingKeteranganTambahan || !fakturData.kode_transaksi}
                options={keteranganTambahanList.map(kt => ({
                  value: kt.kode,
                  label: `${kt.kode} - ${kt.keterangan}`
                }))}
                placeholder="Pilih keterangan tambahan"
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                id="cap_fasilitas"
                label="Cap Fasilitas"
                value={fakturData.cap_fasilitas}
                onChange={(value) => handleSelectChange('cap_fasilitas', value)}
                error={errors.cap_fasilitas}
                disabled={isLoadingCapFasilitas || !fakturData.kode_transaksi}
                options={capFasilitasList.map(cf => ({
                  value: cf.kode,
                  label: `${cf.kode} - ${cf.keterangan}`
                }))}
                placeholder="Pilih cap fasilitas"
              />
            </div>
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