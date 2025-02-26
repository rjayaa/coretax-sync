//src/components/FakturForm/DetailFakturForm.tsx

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
import { CurrencyField } from './CurrencyField';
import { SearchModal } from './SearchBarangJasaModal';
import { Search, Download, AlertTriangle } from 'lucide-react';
import { Label } from '../ui/label';
import { v4 as uuidv4 } from 'uuid';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface DetailFakturFormProps {
  fakturId: string;
  onSubmit: (data: DetailFakturData & { id_detail_faktur: string }) => void;
}

const DetailFakturForm: React.FC<DetailFakturFormProps> = ({ fakturId, onSubmit }) => {
  const [detailData, setDetailData] = useState<DetailFakturData & { selectedItem?: any }>({
    ...INITIAL_DETAIL_STATE,
    id_faktur: fakturId // Pastikan fakturId diset dengan benar di sini
  });
  
  console.log("Current fakturId passed to form:", fakturId); // Log untuk debugging
  
  const { data: satuanUkurList = [], isLoading: isLoadingSatuanUkur } = useSatuanUkur();
  const { data: masterBarangList = [], isLoading: isLoadingBarang } = useMasterDataBarang();
  const { data: masterJasaList = [], isLoading: isLoadingJasa } = useMasterDataJasa();
  const [errors, setErrors] = useState<Partial<Record<keyof DetailFakturData, string>>>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [fakturWarning, setFakturWarning] = useState<boolean>(false);

  // Memastikan fakturId valid
  const isFakturIdValid = fakturId && fakturId.length > 0;

  // Pastikan fakturId diperbarui di state saat props berubah
  useEffect(() => {
    if (fakturId) {
      setDetailData(prev => ({
        ...prev,
        id_faktur: fakturId
      }));
      setFakturWarning(false);
    } else {
      setFakturWarning(true);
    }
  }, [fakturId]);

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

  // Recalculate PPnBM when tarif changes
  useEffect(() => {
    if (detailData.dpp && detailData.tarif_ppnbm) {
      const ppnbm = (parseFloat(detailData.dpp) * parseFloat(detailData.tarif_ppnbm)) / 100;
      setDetailData(prev => ({
        ...prev,
        ppnbm: ppnbm.toString()
      }));
    }
  }, [detailData.dpp, detailData.tarif_ppnbm]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateDetailData(detailData);
    
    // Tambahan validasi untuk fakturId
    if (!isFakturIdValid) {
      setFakturWarning(true);
      toast({
        title: "Error",
        description: "Faktur ID tidak valid. Silakan simpan faktur utama terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Submitting detail with fakturId:', detailData.id_faktur);
    
    if (Object.keys(validationErrors).length === 0) {
      // Calculate data for different fields based on barang or jasa
      const submissionData = {
        ...detailData,
        id_detail_faktur: uuidv4(),
        id_faktur: fakturId, // Pastikan menggunakan fakturId dari props
        jumlah_barang: detailData.barang_or_jasa === 'a' ? detailData.jumlah_barang_jasa : null,
        jumlah_jasa: detailData.barang_or_jasa === 'b' ? detailData.jumlah_barang_jasa : null,
      };
      
      console.log('Final submission data:', submissionData);
      onSubmit(submissionData);
      
      // Reset form but keep fakturId
      setDetailData({ 
        ...INITIAL_DETAIL_STATE, 
        id_faktur: fakturId 
      });
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
        newData.kode_barang_or_jasa = '';
      }
      
      return newData;
    });
    
    if (errors[field as keyof DetailFakturData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCurrencyChange = (field: keyof DetailFakturData) => (value: string) => {
    setDetailData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Calculated total price
  const totalPrice = detailData.harga_satuan && detailData.jumlah_barang_jasa
    ? parseFloat(detailData.harga_satuan) * parseFloat(detailData.jumlah_barang_jasa)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>Tambah Transaksi</CardTitle>
        {fakturWarning && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Pastikan Anda menyimpan Faktur terlebih dahulu sebelum menambahkan Detail Faktur.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden field for fakturId */}
          <input 
            type="hidden" 
            name="id_faktur" 
            value={fakturId} 
          />
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <RadioGroup
                  value={detailData.barang_or_jasa}
                  onValueChange={(value) => handleSelectChange('barang_or_jasa', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="a" id="barang" />
                    <Label htmlFor="barang" className="cursor-pointer">Barang</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="b" id="jasa" />
                    <Label htmlFor="jasa" className="cursor-pointer">Jasa</Label>
                  </div>
                </RadioGroup>
                {errors.barang_or_jasa && (
                  <p className="text-sm text-red-500">{errors.barang_or_jasa}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kode_barang_or_jasa">Kode</Label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setSearchModalOpen(true)}
                      disabled={!detailData.barang_or_jasa}
                    >
                      {detailData.kode_barang_or_jasa ? (
                        <span className="truncate max-w-[300px] inline-block">{detailData.kode_barang_or_jasa}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {`Pilih kode ${detailData.barang_or_jasa === 'a' ? 'barang' : detailData.barang_or_jasa === 'b' ? 'jasa' : ''}`}
                        </span>
                      )}
                      <Search className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                  <Button type="button" variant="outline" className="px-3">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Unduh Kode</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_barang_or_jasa">
                  Nama {detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'} *
                  {detailData.kode_barang_or_jasa && (
                    <span className="text-xs text-muted-foreground ml-1">(nama dapat disesuaikan)</span>
                  )}
                </Label>
                <FormField
                  id="nama_barang_or_jasa"
                  name="nama_barang_or_jasa"
                  value={detailData.nama_barang_or_jasa}
                  onChange={handleChange}
                  error={errors.nama_barang_or_jasa}
                  required
                  placeholder={`Masukkan nama ${detailData.barang_or_jasa === 'a' ? 'barang' : 'jasa'}`}
                  label={''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_satuan_ukur">Satuan *</Label>
                <SelectField
                  id="nama_satuan_ukur"
                  value={detailData.nama_satuan_ukur}
                  onChange={(value) => handleSelectChange('nama_satuan_ukur', value)}
                  error={errors.nama_satuan_ukur}
                  required
                  disabled={isLoadingSatuanUkur}
                  options={satuanUkurList.map(su => ({
                    value: su.id,
                    label: su.satuan
                  }))}
                  placeholder="Pilih satuan" 
                  label={''}
                />
              </div>

              <CurrencyField
                id="harga_satuan"
                label="Harga Satuan"
                value={detailData.harga_satuan}
                onChange={handleCurrencyChange('harga_satuan')}
                error={errors.harga_satuan}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="jumlah_barang_jasa">KUANTITAS</Label>
                <FormField
                  id="jumlah_barang_jasa"
                  name="jumlah_barang_jasa"
                  type="number"
                  value={detailData.jumlah_barang_jasa}
                  onChange={handleChange}
                  error={errors.jumlah_barang_jasa}
                  required 
                  label={''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_harga">Total Harga</Label>
                <CurrencyField
                  id="total_harga"
                  value={totalPrice.toString()}
                  onChange={() => { } }
                  readOnly
                  className="bg-gray-50" 
                  label={''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_diskon">Potongan harga</Label>
                <FormField
                  id="total_diskon"
                  name="total_diskon"
                  type="number"
                  value={detailData.total_diskon}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100" 
                  label={''}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-lg font-medium">PPN dan PPnBM</Label>
                <div className="pt-2">
                  <CurrencyField
                    id="dpp"
                    label="DPP"
                    value={detailData.dpp}
                    onChange={handleCurrencyChange('dpp')}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <CurrencyField
                id="dpp_nilai_lain"
                label="DPP Nilai Lain"
                value={detailData.dpp_nilai_lain}
                onChange={handleCurrencyChange('dpp_nilai_lain')}
                readOnly
                className="bg-gray-50"
              />
              
              <div className="space-y-2">
                <Label htmlFor="tarif_ppn">Tarif PPN</Label>
                <SelectField
                  id="tarif_ppn"
                  value={detailData.tarif_ppn}
                  onChange={(value) => handleSelectChange('tarif_ppn', value)}
                  options={[{ value: '12.00', label: '12%' }]}
                  placeholder="Pilih tarif" 
                  label={''}
                />
              </div>

              <CurrencyField
                id="ppn"
                label="PPN"
                value={detailData.ppn}
                onChange={handleCurrencyChange('ppn')}
                readOnly
                className="bg-gray-50"
              />

              <div className="space-y-2">
                <Label htmlFor="tarif_ppnbm">Tarif PPnBM (%)</Label>
                <FormField
                  id="tarif_ppnbm"
                  name="tarif_ppnbm"
                  type="number"
                  value={detailData.tarif_ppnbm}
                  onChange={handleChange}
                  step="0.01"
                  min="0" 
                  label={''}
                />
              </div>

              <CurrencyField
                id="ppnbm"
                label="PPnBM"
                value={detailData.ppnbm}
                onChange={handleCurrencyChange('ppnbm')}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" className="px-8">
              Batal
            </Button>
            <Button 
              type="submit" 
              className="px-8 bg-blue-500 hover:bg-blue-600"
              disabled={!isFakturIdValid || fakturWarning}
            >
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>

      <SearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        items={detailData.barang_or_jasa === 'a' ? masterBarangList : masterJasaList}
        onSelect={(item) => {
          const kodeValue = detailData.barang_or_jasa === 'a' ? item.kode_barang : item.kode_jasa;
          console.log('Selected item code:', kodeValue);
          
          setDetailData(prev => ({
            ...prev,
            nama_barang_or_jasa: item.bahasa,
            kode_barang_or_jasa: kodeValue,
            selectedItem: item // Simpan item asli untuk referensi
          }));
          setSearchModalOpen(false);
        }}
        title={`Pilih ${detailData.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}`}
        searchByCode
      />
    </Card>
  );
};

export default DetailFakturForm;