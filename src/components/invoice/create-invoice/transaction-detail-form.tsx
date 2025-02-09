import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency, parseCurrency } from '@/lib/utils/formatCurrency'
import { ItemSelector } from './selector/item-selector-dialog'
import { KodeTransaksiSelector } from './selector/kode-transaksi-selector'

interface TransactionDetailProps {
  onSubmit: (data: any) => void
 keteranganTambahanList: Array<{
    id: string;
    kode: string;
    keterangan: string;
    kodeTransaksi: string;
  }>;
}

export function TransactionDetailForm({ onSubmit, keteranganTambahanList }: TransactionDetailProps) {
  const [open, setOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedItemType, setSelectedItemType] = useState("B")
  const [formData, setFormData] = useState({
    kodeTransaksi: '',
    itemType: 'B',
    nama: '',
    satuan: '',
    hargaSatuan: '',
    kuantitas: '1',
    totalHarga: '',
    potonganHarga: '',
    dppValue: '',
    ppnValue: '',
    tarifPPnBM: '0',
    ppnbmValue: ''
  })

  const handleItemSelect = (selectedItem: any) => {
    setFormData(prev => ({
      ...prev,
      nama: selectedItem.bahasa || selectedItem.english || '',
    }))
    setSelectorOpen(false)
  }

  const calculateValues = (
    hargaSatuan: string, 
    kuantitas: string, 
    totalHarga: string, 
    potonganHarga: string,
    isManualTotal: boolean = false
  ) => {
    let total: number;
    
    if (isManualTotal) {
      total = parseCurrency(totalHarga)
    } else {
      const harga = parseCurrency(hargaSatuan)
      const qty = parseFloat(kuantitas) // No currency parsing for quantity
      total = harga * qty
    }

    const potongan = parseCurrency(potonganHarga)
    const afterDiscount = total - potongan
    
    // DPP = Total × (11/12)
    const dppValue = afterDiscount * (11/12)
    
    // PPN = DPP × 12%
    const ppnValue = dppValue * 0.12

    return { total, dppValue, ppnValue }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    const newData = { ...formData, [field]: value }
    
    if (['hargaSatuan', 'kuantitas', 'totalHarga', 'potonganHarga'].includes(field)) {
      const values = calculateValues(
        field === 'hargaSatuan' ? value : formData.hargaSatuan,
        field === 'kuantitas' ? value : formData.kuantitas,
        field === 'totalHarga' ? value : formData.totalHarga,
        field === 'potonganHarga' ? value : formData.potonganHarga,
        field === 'totalHarga' // isManualTotal
      )
      
      newData.totalHarga = values.total.toString()
      newData.dppValue = values.dppValue.toString()
      newData.ppnValue = values.ppnValue.toString()
    }
    
    setFormData(newData)
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold">Detail Transaksi</h3>
        <p className="text-sm text-muted-foreground">
          Masukkan detail transaksi dan perhitungan pajak
        </p>
      </div>

      <div className="space-y-6">
        {/* Item Details Section */}
        <div className="space-y-4">
          <div>
            <Label>Tipe Item</Label>
            <RadioGroup
              defaultValue="B"
              onValueChange={(value: 'B' | 'J') => {
                setSelectedItemType(value)
                setFormData(prev => ({
                  ...prev,
                  itemType: value,
                  nama: ''
                }))
              }}
              className="flex items-center space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="B" />
                <Label htmlFor="B">Barang</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="J" id="J" />
                <Label htmlFor="J">Jasa</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Primary Fields */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div className="col-span-2">
              <Label>Nama {formData.itemType === 'B' ? 'Barang' : 'Jasa'}</Label>
              <div className="relative">
                <Input
                  value={formData.nama}
                  readOnly
                  className="cursor-pointer"
                  onClick={() => setSelectorOpen(true)}
                />
              </div>
            </div>

            <div>
              <Label>Kode Transaksi</Label>
              <div className="relative">
                <Input
                  value={formData.kodeTransaksi ? keteranganTambahanList?.find(
                    (item) => item.kode === formData.kodeTransaksi
                  )?.keterangan || '' : ''}
                  readOnly
                  className="cursor-pointer"
                  onClick={() => setOpen(true)}
                  placeholder="Pilih kode transaksi..."
                />
              </div>
            </div>

            <KodeTransaksiSelector
              open={open}
              onOpenChange={setOpen}
              onSelect={(item) => {
                handleInputChange('kodeTransaksi', item.kode)
              }}
            />

            <div>
              <Label>Satuan</Label>
              <Input
                value={formData.satuan}
                onChange={(e) => handleInputChange('satuan', e.target.value)}
                placeholder="Masukkan satuan"
              />
            </div>

            <div>
              <Label>Harga Satuan</Label>
              <Input
                value={formatCurrency(formData.hargaSatuan)}
                onChange={(e) => handleInputChange('hargaSatuan', e.target.value)}
                className="text-right font-mono"
              />
            </div>

            <div>
              <Label>Kuantitas</Label>
              <Input
                value={formData.kuantitas}
                onChange={(e) => handleInputChange('kuantitas', e.target.value)}
                className="text-right font-mono"
                type="number"
                min="0"
              />
            </div>

            <div>
              <Label>Total</Label>
              <Input
                value={formatCurrency(formData.totalHarga)}
                onChange={(e) => handleInputChange('totalHarga', e.target.value)}
                className="text-right font-mono"
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Pengaturan Tambahan (Opsional)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Potongan Harga</Label>
                <Input
                  value={formatCurrency(formData.potonganHarga)}
                  onChange={(e) => handleInputChange('potonganHarga', e.target.value)}
                  className="text-right font-mono"
                />
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Tax Calculation Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DPP</Label>
              <Input
                value={formatCurrency(formData.dppValue)}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('dppValue', value);
                  // Recalculate PPN when DPP changes
                  const dpp = parseCurrency(value);
                  const ppn = dpp * 0.12;
                  handleInputChange('ppnValue', ppn.toString());
                }}
                className="text-right font-mono"
              />
            </div>

            <div>
              <Label>PPN (12%)</Label>
              <Input
                value={formatCurrency(formData.ppnValue)}
                onChange={(e) => handleInputChange('ppnValue', e.target.value)}
                className="text-right font-mono"
              />
            </div>

            <div>
              <Label>Tarif PPnBM (%)</Label>
              <Input
                value={formData.tarifPPnBM}
                onChange={(e) => handleInputChange('tarifPPnBM', e.target.value)}
                className="text-right font-mono"
                type="number"
                min="0"
              />
            </div>

            <div>
              <Label>PPnBM</Label>
              <Input
                value={formatCurrency(formData.ppnbmValue)}
                readOnly
                className="text-right font-mono bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setFormData({
            kodeTransaksi: '',
            itemType: 'B',
            nama: '',
            satuan: '',
            hargaSatuan: '',
            kuantitas: '1',
            totalHarga: '',
            potonganHarga: '',

            dppValue: '',
            ppnValue: '',
            tarifPPnBM: '0',
            ppnbmValue: ''
          })}>
            Reset
          </Button>
          <Button onClick={() => onSubmit(formData)}>Simpan</Button>
      </div>
        <ItemSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        type={selectedItemType === 'B' ? 'goods' : 'services'}
        onSelect={handleItemSelect}
      />
      </div>

    
    
  )
}

export default TransactionDetailForm