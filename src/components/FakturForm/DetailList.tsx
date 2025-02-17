// components/DetailList/index.tsx
import React from 'react';
import { DetailFakturData, FakturData } from '@/types/faktur';

interface DetailListProps {
    npwp_penjual: FakturData['npwp_penjual'];
  details: DetailFakturData[];
}

export const DetailList: React.FC<DetailListProps> = ({ details }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Detail List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
                      <tr className="bg-gray-100">           
              <th className="p-2 border">Nama Barang/Jasa</th>
              <th className="p-2 border">Harga Satuan</th>
              <th className="p-2 border">Jumlah</th>
              <th className="p-2 border">DPP</th>
              <th className="p-2 border">DPP Nilai Lain</th>
              <th className="p-2 border">PPN</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
                <tr key={index}>  
                <td className="p-2 border">{detail.nama_barang_or_jasa}</td>
                <td className="p-2 border text-right">
                  {parseFloat(detail.harga_satuan).toLocaleString()}
                </td>
              <td className="p-2 border text-right">
                    {detail.jumlah_barang || detail.jumlah_jasa}
                </td>
                <td className="p-2 border text-right">
                  {parseFloat(detail.dpp).toLocaleString()}
                </td>
                <td className="p-2 border text-right">
                  {parseFloat(detail.dpp_nilai_lain).toLocaleString()}
                </td>
                <td className="p-2 border text-right">
                  {parseFloat(detail.ppn).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};