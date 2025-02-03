// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Label } from '@/components/ui/label'
// import { ItemSelector } from './item-selector-dialog'
// import { formatCurrency, parseCurrency } from '@/lib/utils/formatCurrency'

// interface Item {
//   id: string;
//   item_type: 'GOODS' | 'SERVICE';
//   goods_id?: string;
//   service_id?: string;
//   item_name: string;
//   unit: string;
//   unit_price: number;
//   quantity: number;
//   total_price: number;
// }

// interface ItemDetailFormProps {
//   items: Item[];
//   onItemsChange: (items: Item[]) => void;
// }

// export function ItemDetailForm({ items, onItemsChange }: ItemDetailFormProps) {
//   const [selectorOpen, setSelectorOpen] = useState(false)
//   const [selectedItemType, setSelectedItemType] = useState<'goods' | 'services'>('goods')
//   const [editingIndex, setEditingIndex] = useState<number | null>(null)

//   const handleAddItem = () => {
//     onItemsChange([...items, {
//       id: '',
//       item_type: 'GOODS',
//       item_name: '',
//       unit: '',
//       unit_price: 0,
//       quantity: 1,
//       total_price: 0
//     }])
//     setEditingIndex(items.length)
//   }

//   const handleItemSelect = (selectedItem: any, index: number) => {
//     const newItems = [...items]
//     newItems[index] = {
//       ...newItems[index],
//       id: selectedItem.id,
//       item_name: selectedItem.bahasa,
//       [selectedItemType === 'goods' ? 'goods_id' : 'service_id']: selectedItem.id,
//       item_type: selectedItemType === 'goods' ? 'GOODS' : 'SERVICE'
//     }
//     onItemsChange(newItems)
//   }

//   const handleItemUpdate = (index: number, field: keyof Item, value: any) => {
//     const newItems = [...items]
//     const item = newItems[index]

//     if (field === 'unit_price' || field === 'quantity') {
//       const numValue = parseCurrency(value)
//       newItems[index] = {
//         ...item,
//         [field]: numValue,
//         total_price: field === 'unit_price' 
//           ? numValue * item.quantity
//           : item.unit_price * numValue
//       }
//     } else {
//       newItems[index] = {
//         ...item,
//         [field]: value
//       }
//     }

//     onItemsChange(newItems)
//   }

//   const handleRemoveItem = (index: number) => {
//     onItemsChange(items.filter((_, i) => i !== index))
//   }

//   return (
//     <div className="space-y-6 p-6 bg-card rounded-lg border">
//       <div>
//         <h3 className="text-lg font-semibold">Detail Item</h3>
//         <p className="text-sm text-muted-foreground">
//           Tambahkan item-item yang akan dimasukkan ke dalam faktur
//         </p>
//       </div>

//       <div className="space-y-4">
//         {items.map((item, index) => (
//           <div key={index} className="p-4 border rounded-lg space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label>Jenis Item</Label>
//                 <Select
//                   value={item.item_type === 'GOODS' ? 'goods' : 'services'}
//                   onValueChange={(value: 'goods' | 'services') => {
//                     setSelectedItemType(value)
//                     setEditingIndex(index)
//                     setSelectorOpen(true)
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Pilih Jenis" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="goods">Barang</SelectItem>
//                     <SelectItem value="services">Jasa</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Nama {item.item_type === 'GOODS' ? 'Barang' : 'Jasa'}</Label>
//                 <div className="relative">
//                   <Input
//                     value={item.item_name}
//                     readOnly
//                     className="cursor-pointer"
//                     onClick={() => {
//                       setEditingIndex(index)
//                       setSelectorOpen(true)
//                     }}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label>Unit</Label>
//                 <Input
//                   value={item.unit}
//                   onChange={(e) => handleItemUpdate(index, 'unit', e.target.value)}
//                   placeholder="Masukkan unit"
//                 />
//               </div>

//               <div>
//                 <Label>Harga Satuan</Label>
//                 <Input
//                   value={formatCurrency(item.unit_price.toString())}
//                   onChange={(e) => handleItemUpdate(index, 'unit_price', e.target.value)}
//                   placeholder="0"
//                   className="text-right font-mono"
//                 />
//               </div>

//                  <div>
//                 <Label>Jumlah</Label>
//                 <Input
//                   value={formatCurrency(item.quantity.toString())}
//                   onChange={(e) => handleItemUpdate(index, 'quantity', e.target.value)}
//                   placeholder="0"
//                   className="text-right font-mono"
//                 />
//               </div>

//             </div>

//               <Button
//               variant="destructive"
//               size="sm"
//               onClick={() => handleRemoveItem(index)}
//             >
//               Hapus Item
//             </Button>
//           </div>
//         ))}
//       </div>

//       <Button onClick={handleAddItem}>
//         Tambah Item
//       </Button>

//       {editingIndex !== null && (
//         <ItemSelector
//           open={selectorOpen}
//           onOpenChange={setSelectorOpen}
//           type={selectedItemType}
//           onSelect={(item) => handleItemSelect(item, editingIndex)}
//         />
//       )}
//     </div>
//   )
// }


'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { ItemSelector } from './item-selector-dialog'
import { formatCurrency, parseCurrency } from '@/lib/utils/formatCurrency'

interface Item {
  barangJasa: 'B' | 'J';
  kodeBarangJasa: string;
  namaBarangJasa: string;
  namaSatuanUkur: string;
  hargaSatuan: number;
  jumlah: number;
  hargaTotal: number;
  diskon: number;
  dpp: number;
  ppn: number;
  tarifPpnbm: number;
  ppnbm: number;
  // Tambahan field untuk tampilan
  masterData?: {
    id: string;
    goods_services?: string;
    bahasa?: string;
    english?: string;
  };
}

interface ItemDetailFormProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
}

export function ItemDetailForm({ items, onItemsChange }: ItemDetailFormProps) {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedItemType, setSelectedItemType] = useState<'B' | 'J'>('B')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleAddItem = () => {
    onItemsChange([...items, {
      barangJasa: selectedItemType,
      kodeBarangJasa: '',
      namaBarangJasa: '',
      namaSatuanUkur: '',
      hargaSatuan: 0,
      jumlah: 1,
      hargaTotal: 0,
      diskon: 0,
      dpp: 0,
      ppn: 0,
      tarifPpnbm: 0,
      ppnbm: 0
    }])
    setEditingIndex(items.length)
  }

  const handleItemSelect = (selectedItem: any, index: number) => {
    const newItems = [...items]
    
    // Mengisi data dari master
    newItems[index] = {
      ...newItems[index],
      kodeBarangJasa: selectedItem.id,
      namaBarangJasa: selectedItem.bahasa || selectedItem.english || '',
      masterData: selectedItem
    }
    
    onItemsChange(newItems)
  }

  const handleItemUpdate = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const item = newItems[index]

    if (field === 'hargaSatuan' || field === 'jumlah' || field === 'diskon') {
      const numValue = parseCurrency(value)
      
      // Hitung total harga
      const hargaTotal = field === 'hargaSatuan' ?
        numValue * item.jumlah :
        item.hargaSatuan * (field === 'jumlah' ? numValue : item.jumlah)

      // Hitung diskon jika ada
      const diskonValue = field === 'diskon' ? numValue : (item.diskon || 0)
      const nilaiDiskon = (diskonValue / 100) * hargaTotal

      // Hitung DPP (setelah diskon)
      const dpp = hargaTotal - nilaiDiskon

      // Hitung PPN (11% dari DPP)
      const ppn = dpp * 0.11

      // Update item dengan nilai baru
      newItems[index] = {
        ...item,
        [field]: numValue,
        hargaTotal,
        dpp,
        ppn
      }
    } else {
      newItems[index] = {
        ...item,
        [field]: value
      }
    }

    onItemsChange(newItems)
  }

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <div>
        <h3 className="text-lg font-semibold">Detail Item</h3>
        <p className="text-sm text-muted-foreground">
          Tambahkan item-item yang akan dimasukkan ke dalam faktur
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jenis Item</Label>
                <Select
                  value={item.barangJasa}
                  onValueChange={(value: 'B' | 'J') => {
                    setSelectedItemType(value)
                    setEditingIndex(index)
                    setSelectorOpen(true)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">Barang</SelectItem>
                    <SelectItem value="J">Jasa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nama {item.barangJasa === 'B' ? 'Barang' : 'Jasa'}</Label>
                <div className="relative">
                  <Input
                    value={item.namaBarangJasa}
                    readOnly
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingIndex(index)
                      setSelectorOpen(true)
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Kode</Label>
                <Input
                  value={item.kodeBarangJasa}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Input
                  value={item.namaSatuanUkur}
                  onChange={(e) => handleItemUpdate(index, 'namaSatuanUkur', e.target.value)}
                  placeholder="Masukkan unit"
                />
              </div>

              <div>
                <Label>Harga Satuan</Label>
                <Input
                  value={formatCurrency(item.hargaSatuan.toString())}
                  onChange={(e) => handleItemUpdate(index, 'hargaSatuan', e.target.value)}
                  placeholder="0"
                  className="text-right font-mono"
                />
              </div>

              <div>
                <Label>Jumlah</Label>
                <Input
                  value={formatCurrency(item.jumlah.toString())}
                  onChange={(e) => handleItemUpdate(index, 'jumlah', e.target.value)}
                  placeholder="0"
                  className="text-right font-mono"
                />
              </div>

              <div>
                <Label>Diskon (%)</Label>
                <Input
                  value={formatCurrency(item.diskon.toString())}
                  onChange={(e) => handleItemUpdate(index, 'diskon', e.target.value)}
                  placeholder="0"
                  className="text-right font-mono"
                />
              </div>

              <div>
                <Label>Total</Label>
                <Input
                  value={formatCurrency(item.hargaTotal.toString())}
                  readOnly
                  className="text-right font-mono bg-muted"
                />
              </div>

              <div>
                <Label>DPP</Label>
                <Input
                  value={formatCurrency(item.dpp.toString())}
                  readOnly
                  className="text-right font-mono bg-muted"
                />
              </div>

              <div>
                <Label>PPN</Label>
                <Input
                  value={formatCurrency(item.ppn.toString())}
                  readOnly
                  className="text-right font-mono bg-muted"
                />
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveItem(index)}
            >
              Hapus Item
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleAddItem}>
        Tambah Item
      </Button>

      <ItemSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        type={selectedItemType === 'B' ? 'goods' : 'services'}
        onSelect={(item) => handleItemSelect(item, editingIndex!)}
      />
    </div>
  )
}