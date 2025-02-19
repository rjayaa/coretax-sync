'use client';

// components/DetailFakturForm/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '../FakturForm/FormField';
import { DetailFakturData } from '@/types/faktur';
import { validateDetailData } from '@/utils/validation';
import { calculateDetailValues } from '@/utils/calculations';
import { INITIAL_DETAIL_STATE } from '@/constants/faktur';

interface DetailFakturFormProps {
  fakturId: string;
  onSubmit: (data: DetailFakturData & { id_detail_faktur: string }) => void;
}

const DetailFakturForm: React.FC<DetailFakturFormProps> = ({ fakturId, onSubmit }) => {
  const [detailData, setDetailData] = useState<DetailFakturData>({
    ...INITIAL_DETAIL_STATE,
    id_faktur: fakturId
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DetailFakturData, string>>>({});

  useEffect(() => {
    if (detailData.harga_satuan && detailData.jumlah_barang_jasa) {
      const { dpp, dpp_nilai_lain, ppn } = calculateDetailValues(
        parseFloat(detailData.harga_satuan),
        parseFloat(detailData.jumlah_barang_jasa),
        parseFloat(detailData.total_diskon)
      );

      setDetailData(prev => ({
        ...prev,
        dpp,
        dpp_nilai_lain,
        ppn
      }));
    }
  }, [detailData.harga_satuan, detailData.jumlah_barang_jasa, detailData.total_diskon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateDetailData(detailData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        ...detailData,
        id_detail_faktur: crypto.randomUUID()
      });
      setDetailData({ ...INITIAL_DETAIL_STATE, id_faktur: fakturId });
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetailData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof DetailFakturData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detail Faktur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barang_or_jasa">Barang/Jasa</Label>
              <Select
                value={detailData.barang_or_jasa}
                onValueChange={(value) => {
                  setDetailData(prev => ({ ...prev, barang_or_jasa: value }));
                  if (errors.barang_or_jasa) {
                    setErrors(prev => ({ ...prev, barang_or_jasa: undefined }));
                  }
                }}
              >
                <SelectTrigger className={errors.barang_or_jasa ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Barang</SelectItem>
                  <SelectItem value="b">Jasa</SelectItem>
                </SelectContent>
              </Select>
              {errors.barang_or_jasa && (
                <p className="text-sm text-red-500">{errors.barang_or_jasa}</p>
              )}
            </div>

            <FormField
              id="kode_barang_jasa"
              label="Kode Barang/Jasa"
              value={detailData.kode_barang_jasa}
              onChange={handleChange}
              maxLength={25}
            />
          </div>

          <FormField
            id="nama_barang_jasa"
            label="Nama Barang/Jasa"
            value={detailData.nama_barang_jasa}
            onChange={handleChange}
            error={errors.nama_barang_jasa}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="nama_satuan_ukur"
              label="Nama Satuan Ukur"
              value={detailData.nama_satuan_ukur}
              onChange={handleChange}
              error={errors.nama_satuan_ukur}
              required
            />

            <FormField
              id="harga_satuan"
              label="Harga Satuan"
              type="number"
              step="0.01"
              value={detailData.harga_satuan}
              onChange={handleChange}
              error={errors.harga_satuan}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="jumlah_barang_jasa"
              label="Jumlah Barang/Jasa"
              type="number"
              value={detailData.jumlah_barang_jasa}
              onChange={handleChange}
              error={errors.jumlah_barang_jasa}
              required
            />

            <FormField
              id="total_diskon"
              label="Total Diskon (%)"
              type="number"
              value={detailData.total_diskon}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
            />
          </div>

          {/* Read-only calculated fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="dpp"
              label="DPP"
              type="number"
              value={detailData.dpp}
              readOnly
              className="bg-gray-100"
            />

            <FormField
              id="dpp_nilai_lain"
              label="DPP Nilai Lain"
              type="number"
              value={detailData.dpp_nilai_lain}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="tarif_ppn"
              label="Tarif PPN (%)"
              type="number"
              value={detailData.tarif_ppn}
              readOnly
              className="bg-gray-100"
            />

            <FormField
              id="ppn"
              label="PPN"
              type="number"
              value={detailData.ppn}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="tarif_ppnbm"
              label="Tarif PPnBM (%)"
              type="number"
              value={detailData.tarif_ppnbm}
              onChange={handleChange}
              step="0.01"
              min="0"
            />

            <FormField
              id="ppnbm"
              label="PPnBM"
              type="number"
              value={detailData.ppnbm}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <Button type="submit" className="w-full">
            Tambah Detail
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DetailFakturForm;