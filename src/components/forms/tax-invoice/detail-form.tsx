"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DetailItem, TransactionType } from "@/types/tax-invoice";
import { useState } from "react";

interface DetailFormProps {
  items: DetailItem[];
  transactionType: TransactionType;
  referenceDP?: string;
  onItemChange: (index: number, field: keyof DetailItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

const formatIDR = (value: string | number): string => {
  const number = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number || 0);
};

const unformatNumber = (value: string): string => {
  return value.replace(/[^\d.-]/g, '');
};

export default function DetailForm({
  items,
  transactionType,
  referenceDP,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: DetailFormProps) {
  const [editingValue, setEditingValue] = useState<{[key: string]: string}>({});

  const handleFocus = (index: number, field: keyof DetailItem) => {
    const key = `${index}-${field}`;
    setEditingValue({
      ...editingValue,
      [key]: unformatNumber(items[index][field])
    });
  };

  const handleBlur = (index: number, field: keyof DetailItem) => {
    const key = `${index}-${field}`;
    const value = editingValue[key] || '0';
    onItemChange(index, field, value);
    setEditingValue({});
  };

  return (
    <div className="space-y-4">
      <Button onClick={onAddItem} variant="outline">
        Tambah Item
      </Button>

      {items.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nama Barang/Jasa</Label>
              <Input 
                value={item.namaBarang}
                onChange={(e) => onItemChange(index, 'namaBarang', e.target.value)}
                placeholder="Nama Barang/Jasa"
              />
            </div>
            
            <div>
              <Label>Harga Satuan</Label>
              <Input 
                value={editingValue[`${index}-hargaSatuan`] !== undefined 
                  ? editingValue[`${index}-hargaSatuan`]
                  : formatIDR(item.hargaSatuan)}
                onChange={(e) => {
                  const key = `${index}-hargaSatuan`;
                  setEditingValue({
                    ...editingValue,
                    [key]: unformatNumber(e.target.value)
                  });
                }}
                onFocus={() => handleFocus(index, 'hargaSatuan')}
                onBlur={() => handleBlur(index, 'hargaSatuan')}
                placeholder="Harga Satuan"
                className="text-right"
              />
            </div>

            <div>
              <Label>Jumlah</Label>
              <Input 
                type="number"
                value={item.jumlahBarang}
                onChange={(e) => onItemChange(index, 'jumlahBarang', e.target.value)}
                placeholder="Jumlah"
                className="text-right"
              />
            </div>

            <div>
              <Label>Harga Jual Total</Label>
              <Input 
                value={editingValue[`${index}-hargaJualTotal`] !== undefined 
                  ? editingValue[`${index}-hargaJualTotal`]
                  : formatIDR(item.hargaJualTotal)}
                onChange={(e) => {
                  const key = `${index}-hargaJualTotal`;
                  setEditingValue({
                    ...editingValue,
                    [key]: unformatNumber(e.target.value)
                  });
                }}
                onFocus={() => handleFocus(index, 'hargaJualTotal')}
                onBlur={() => handleBlur(index, 'hargaJualTotal')}
                placeholder="Harga Jual Total"
                className="text-right"
              />
            </div>

            <div>
              <Label>Potongan Harga</Label>
              <Input 
                value={editingValue[`${index}-potonganHarga`] !== undefined 
                  ? editingValue[`${index}-potonganHarga`]
                  : formatIDR(item.potonganHarga)}
                onChange={(e) => {
                  const key = `${index}-potonganHarga`;
                  setEditingValue({
                    ...editingValue,
                    [key]: unformatNumber(e.target.value)
                  });
                }}
                onFocus={() => handleFocus(index, 'potonganHarga')}
                onBlur={() => handleBlur(index, 'potonganHarga')}
                placeholder="Potongan Harga"
                className="text-right"
              />
            </div>

            <div>
              <Label>Uang Muka</Label>
              <Input 
                value={editingValue[`${index}-uangMuka`] !== undefined 
                  ? editingValue[`${index}-uangMuka`]
                  : formatIDR(item.uangMuka)}
                onChange={(e) => {
                  const key = `${index}-uangMuka`;
                  setEditingValue({
                    ...editingValue,
                    [key]: unformatNumber(e.target.value)
                  });
                }}
                onFocus={() => handleFocus(index, 'uangMuka')}
                onBlur={() => handleBlur(index, 'uangMuka')}
                placeholder="Uang Muka"
                className="text-right"
                disabled={transactionType === 'REMAINING_PAYMENT'}
              />
            </div>

            <div>
              <Label>DPP</Label>
              <Input 
                value={formatIDR(item.dpp)}
                readOnly
                className="bg-gray-50 text-right"
              />
            </div>

            <div>
              <Label>DPP Nilai Lain (DPP × 11/12)</Label>
              <Input 
                value={formatIDR(item.dppNilaiLain)}
                readOnly
                className="bg-gray-50 text-right"
              />
            </div>

            <div>
              <Label>PPN (12% dari DPP Nilai Lain)</Label>
              <Input 
                value={formatIDR(item.ppn)}
                readOnly
                className="bg-gray-50 text-right"
              />
            </div>

            <div>
              <Label>PPnBM (10%)</Label>
              <Input 
                value={formatIDR(item.ppnbm)}
                readOnly
                className="bg-gray-50 text-right"
              />
            </div>
          </div>
          
          {index > 0 && (
            <Button 
              onClick={() => onRemoveItem(index)}
              variant="destructive"
              className="mt-4"
            >
              Hapus Item
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}