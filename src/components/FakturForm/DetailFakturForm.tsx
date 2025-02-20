'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '../FakturForm/FormField';
import { DetailFakturData } from '@/types/faktur';
import { validateDetailData } from '@/lib/utils/validation';
import { INITIAL_DETAIL_STATE } from '@/constants/faktur';
import { calculateDetailValues } from '@/lib/utils/calculations';
import { useSatuanUkur } from '@/hooks/use-satuan-ukur';
import { useMasterDataBarang } from '@/hooks/use-master-barang';
import { useMasterDataJasa } from '@/hooks/use-master-jasa';
import { SelectField } from './SelectField';
import { SearchModal } from './SearchBarangJasaModal';
import { Search } from 'lucide-react';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';

interface DetailFakturFormProps {
  fakturId: string;
  onSubmit: (data: DetailFakturData & { id_detail_faktur: string }) => void;
}

const DetailFakturForm: React.FC<DetailFakturFormProps> = ({ fakturId, onSubmit }) => {
  const [detailData, setDetailData] = useState<DetailFakturData>({
    ...INITIAL_DETAIL_STATE,
    id_faktur: fakturId
  });
  const { data: satuanUkurList = [], isLoading: isLoadingSatuanUkur } = useSatuanUkur();
  const { data: masterBarangList = [], isLoading: isLoadingBarang } = useMasterDataBarang();
  const { data: masterJasaList = [], isLoading: isLoadingJasa } = useMasterDataJasa();
  const [errors, setErrors] = useState<Partial<Record<keyof DetailFakturData, string>>>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    if (detailData.harga_satuan && detailData.jumlah_barang_jasa) {
      const { dpp, dpp_nilai_lain, ppn } = calculateDetailValues(
        parseFloat(detailData.harga_satuan),
        parseFloat(detailData.jumlah_barang_jasa),
        parseFloat(detailData.total_diskon)
      );

      setDetailData(prev => ({
        ...prev,
        dpp: dpp.toString(),
        dpp_nilai_lain: dpp_nilai_lain.toString(),
        ppn: ppn.toString()
      }));
    }
  }, [detailData.harga_satuan, detailData.jumlah_barang_jasa, detailData.total_diskon]);

  // Recalculate PPN when DPP or tarif_ppn changes
  useEffect(() => {
    if (detailData.dpp && detailData.tarif_ppn) {
      const ppn = (parseFloat(detailData.dpp) * parseFloat(detailData.tarif_ppn)) / 100;
      setDetailData(prev => ({
        ...prev,
        ppn: ppn.toString()
      }));
    }
  }, [detailData.dpp, detailData.tarif_ppn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateDetailData(detailData);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        ...detailData,
        id_detail_faktur: uuidv4()
      });
      setDetailData({ ...INITIAL_DETAIL_STATE, id_faktur: fakturId });
      setErrors({});
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

  const handleSelectChange = (field: string, value: string) => {
    setDetailData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'barang_or_jasa') {
        newData.nama_barang_or_jasa = '';
        newData.kode_barang_jasa = '';
      }
      
      return newData;
    });
    
    if (errors[field as keyof DetailFakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
            <SelectField
              id="barang_or_jasa"
              label="Barang/Jasa"
              value={detailData.barang_or_jasa}
              onChange={(value) => handleSelectChange('barang_or_jasa', value)}
              error={errors.barang_or_jasa}
              required
              options={[
                { value: 'a', label: 'Barang' },
                { value: 'b', label: 'Jasa' }
              ]}
              placeholder="Pilih jenis"
            />

            <FormField
              id="kode_barang_jasa"
              label="Kode Barang/Jasa"
              value={detailData.kode_barang_jasa}
              onChange={handleChange}
              maxLength={25}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_barang_or_jasa">
              Nama Barang/Jasa
              {errors.nama_barang_or_jasa && (
                <span className="text-sm text-red-500 ml-1">*</span>
              )}
            </Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setSearchModalOpen(true)}
              disabled={!detailData.barang_or_jasa || (detailData.barang_or_jasa === 'a' ? isLoadingBarang : isLoadingJasa)}
            >
              {detailData.nama_barang_or_jasa ? (
                <span className="truncate">{detailData.nama_barang_or_jasa}</span>
              ) : (
                <span className="text-muted-foreground">
                  {`Pilih ${detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}`}
                </span>
              )}
              <Search className="h-4 w-4 ml-2" />
            </Button>
            {errors.nama_barang_or_jasa && (
              <p className="text-sm text-red-500">{errors.nama_barang_or_jasa}</p>
            )}
          </div>

          <SearchModal
            open={searchModalOpen}
            onOpenChange={setSearchModalOpen}
            items={detailData.barang_or_jasa === 'a' ? masterBarangList : masterJasaList}
            onSelect={(item) => {
              setDetailData(prev => ({
                ...prev,
                nama_barang_or_jasa: item.bahasa,
                kode_barang_jasa: detailData.barang_or_jasa === 'a' ? item.kode_barang : item.kode_jasa
              }));
              setSearchModalOpen(false);
            }}
            title={`Pilih ${detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}`}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              id="nama_satuan_ukur"
              label="Nama Satuan Ukur"
              value={detailData.nama_satuan_ukur}
              onChange={(value) => handleSelectChange('nama_satuan_ukur', value)}
              error={errors.nama_satuan_ukur}
              required
              disabled={isLoadingSatuanUkur}
              options={satuanUkurList.map(su => ({
                value: su.id,
                label: `${su.id} - ${su.satuan}`
              }))}
              placeholder="Satuan Ukur"
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="dpp"
              label="DPP"
              type="number"
              value={detailData.dpp}
              onChange={handleChange}
            />

            <FormField
              id="dpp_nilai_lain"
              label="DPP Nilai Lain"
              type="number"
              value={detailData.dpp_nilai_lain}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="tarif_ppn"
              label="Tarif PPN (%)"
              type="number"
              value={detailData.tarif_ppn}
              onChange={handleChange}
            />

            <FormField
              id="ppn"
              label="PPN"
              type="number"
              value={detailData.ppn}
              onChange={handleChange}
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