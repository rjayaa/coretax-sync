import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DetailItem, TransactionType } from "@/types/tax-invoice";

interface MasterItem {
  id: string;
  name: string;
}

interface DetailFormProps {
  items: DetailItem[];
  transactionType: TransactionType;
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

const unformatNumber = (value: string | undefined): string => {
  if (!value) return '0';
  return value.replace(/[^\d.-]/g, '');
};

export default function DetailForm({
  items,
  transactionType,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: DetailFormProps) {
  const [editingValue, setEditingValue] = useState<{[key: string]: string}>({});
  const [goods, setGoods] = useState<MasterItem[]>([]);
  const [services, setServices] = useState<MasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downPaymentAmount, setDownPaymentAmount] = useState("0");

  // Calculate total of all items
  const totalAmount = items.reduce((total, item) => {
    const itemTotal = Number(item.hargaSatuan || 0) * Number(item.jumlahBarang || 0);
    return total + itemTotal;
  }, 0);

  // Calculate tax base (DPP) based on transaction type
  const calculateDPP = () => {
    if (transactionType === 'DOWN_PAYMENT') {
      return Number(downPaymentAmount);
    }
    return totalAmount;
  };

  // Calculate taxes
  const dpp = calculateDPP();
  const dppNilaiLain = (dpp * 11) / 12;
  const ppn = dppNilaiLain * 0.12;
  const ppnbm = dpp * 0.1;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const [goodsResponse, servicesResponse] = await Promise.all([
          fetch('/api/goods'),
          fetch('/api/services')
        ]);

        if (goodsResponse.ok && servicesResponse.ok) {
          const goodsData = await goodsResponse.json();
          const servicesData = await servicesResponse.json();

          if (goodsData.success && goodsData.goods) {
            setGoods(goodsData.goods);
          }
          if (servicesData.success && servicesData.services) {
            setServices(servicesData.services);
          }
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Calculate item total when price or quantity changes
  const calculateItemTotal = (index: number) => {
    const item = items[index];
    const hargaSatuan = Number(item.hargaSatuan || 0);
    const jumlahBarang = Number(item.jumlahBarang || 0);
    const total = (hargaSatuan * jumlahBarang).toString();
    onItemChange(index, 'hargaJualTotal', total);
  };

  const handleFocus = (index: number, field: keyof DetailItem) => {
    const key = `${index}-${field}`;
    const value = items[index][field];
    setEditingValue({
      ...editingValue,
      [key]: unformatNumber(value)
    });
  };

  const handleBlur = (index: number, field: keyof DetailItem) => {
    const key = `${index}-${field}`;
    const value = editingValue[key] || '0';
    onItemChange(index, field, value);
    setEditingValue({});
    if (field === 'hargaSatuan' || field === 'jumlahBarang') {
      calculateItemTotal(index);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={onAddItem} variant="outline">
        Tambah Item
      </Button>

      {/* Detail Items */}
      {items.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Item Selection */}
            <div>
              <Label>Jenis Item</Label>
              <Select 
                value={item.barangJasa} 
                onValueChange={(value) => {
                  onItemChange(index, 'barangJasa', value);
                  onItemChange(index, 'namaBarang', '');
                  onItemChange(index, 'goods_id', '');
                  onItemChange(index, 'service_id', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Barang</SelectItem>
                  <SelectItem value="B">Jasa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{item.barangJasa === 'A' ? 'Pilih Barang' : 'Pilih Jasa'}</Label>
              <Select
                disabled={!item.barangJasa || isLoading}
                value={item.barangJasa === 'A' ? item.goods_id : item.service_id}
                onValueChange={(value) => {
                  const items = item.barangJasa === 'A' ? goods : services;
                  const selectedItem = items.find(i => i.id === value);
                  if (selectedItem) {
                    onItemChange(index, 'namaBarang', selectedItem.name);
                    onItemChange(index, item.barangJasa === 'A' ? 'goods_id' : 'service_id', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading..." : `Pilih ${item.barangJasa === 'A' ? 'barang' : 'jasa'}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(item.barangJasa === 'A' ? goods : services).map((masterItem) => (
                    <SelectItem key={masterItem.id} value={masterItem.id}>
                      {masterItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Quantity */}
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
                onChange={(e) => {
                  onItemChange(index, 'jumlahBarang', e.target.value);
                  calculateItemTotal(index);
                }}
                placeholder="Jumlah"
                className="text-right"
                min="0"
              />
            </div>

            <div>
              <Label>Total</Label>
              <Input 
                value={formatIDR(item.hargaJualTotal)}
                className="text-right bg-gray-50"
                readOnly
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

      {/* Summary Card */}
      <Card className="p-4 mt-8 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Ringkasan Pembayaran</h3>
        <div className="space-y-4">
          <div>
            <Label>Total Amount</Label>
            <Input 
              value={formatIDR(totalAmount)}
              readOnly
              className="bg-gray-100 text-right"
            />
          </div>

          {transactionType === 'DOWN_PAYMENT' && (
            <div>
              <Label>Jumlah Uang Muka</Label>
              <Input 
                value={editingValue['downPayment'] || formatIDR(downPaymentAmount)}
                onChange={(e) => {
                  const value = unformatNumber(e.target.value);
                  setEditingValue({
                    ...editingValue,
                    downPayment: value
                  });
                }}
                onFocus={() => {
                  setEditingValue({
                    ...editingValue,
                    downPayment: downPaymentAmount
                  });
                }}
                onBlur={() => {
                  const value = editingValue['downPayment'] || '0';
                  setDownPaymentAmount(value);
                  setEditingValue({});
                }}
                className="text-right"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>DPP</Label>
              <Input 
                value={formatIDR(dpp)}
                readOnly
                className="bg-gray-100 text-right"
              />
            </div>
            <div>
              <Label>DPP Nilai Lain</Label>
              <Input 
                value={formatIDR(dppNilaiLain)}
                readOnly
                className="bg-gray-100 text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>PPN (12%)</Label>
              <Input 
                value={formatIDR(ppn)}
                readOnly
                className="bg-gray-100 text-right"
              />
            </div>
            <div>
              <Label>PPnBM (10%)</Label>
              <Input 
                value={formatIDR(ppnbm)}
                readOnly
                className="bg-gray-100 text-right"
              />
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t">
            <Label className="text-lg">Total Tagihan</Label>
            <Input 
              value={formatIDR(dpp + ppn + ppnbm)}
              readOnly
              className="bg-gray-100 text-right text-lg font-bold"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}