// src/components/DetailList.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailFakturData } from '@/types/faktur';
import { Pencil, Trash2 } from 'lucide-react';

interface DetailListProps {
  details: DetailFakturData[];
  onDelete: (id: string) => void;
  onEdit: (detail: DetailFakturData) => void;
  editingId?: string;
}

export const DetailList: React.FC<DetailListProps> = ({
  details,
  onDelete,
  onEdit,
  editingId,
}) => {
  // Format currency for display
  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'Rp 0';
    return `Rp ${parseFloat(value).toLocaleString('id-ID')}`;
  };

  if (details.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Belum ada item detail. Tambahkan item menggunakan form di atas.
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PPN</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {details.map((detail) => {
            const isEditing = detail.id_detail_faktur === editingId;
            const totalHarga = parseFloat(detail.harga_satuan) * parseFloat(detail.jumlah_barang_jasa);
            
            return (
              <tr key={detail.id_detail_faktur} className={isEditing ? 'bg-blue-50' : ''}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{detail.nama_barang_or_jasa}</div>
                  {detail.kode_barang_or_jasa && (
                    <div className="text-xs text-gray-500">Kode: {detail.kode_barang_or_jasa}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    detail.barang_or_jasa === 'a' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {detail.barang_or_jasa === 'a' ? 'Barang' : 'Jasa'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {detail.nama_satuan_ukur}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(detail.harga_satuan)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                  {detail.jumlah_barang_jasa}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(totalHarga.toString())}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(detail.ppn)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(detail)}
                      disabled={isEditing}
                      className={isEditing ? 'bg-blue-100' : ''}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(detail.id_detail_faktur!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right text-gray-700">
              Total:
            </td>
            <td className="px-4 py-3 text-sm font-bold text-gray-900">
              {formatCurrency(details.reduce((sum, item) => sum + parseFloat(item.dpp), 0).toString())}
            </td>
            <td className="px-4 py-3 text-sm font-bold text-gray-900">
              {formatCurrency(details.reduce((sum, item) => sum + parseFloat(item.ppn), 0).toString())}
            </td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={5} className="px-4 py-3 text-sm font-medium text-right text-gray-700">
              Grand Total:
            </td>
            <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900">
              {formatCurrency(
                details
                  .reduce((sum, item) => sum + parseFloat(item.dpp) + parseFloat(item.ppn), 0)
                  .toString()
              )}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};