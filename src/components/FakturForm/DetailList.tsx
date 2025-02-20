'use client';

import React from 'react';
import { DetailFakturData, FakturData } from '@/types/faktur';
import { Card, CardContent } from '@/components/ui/card';

interface DetailListProps {
  details: DetailFakturData[];
  faktur: FakturData;
}

export const DetailList: React.FC<DetailListProps> = ({ details, faktur }) => {
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">NPWP Pembeli</p>
                <p className="font-medium">{faktur.npwp_nik_pembeli}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nama Pembeli</p>
                <p className="font-medium">{faktur.nama_pembeli}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Detail List</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">           
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nama Barang/Jasa</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Harga Satuan</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Jumlah</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">DPP</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">DPP Nilai Lain</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">PPN</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {details.map((detail, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">  
                  <td className="px-4 py-3 text-sm text-gray-900">{detail.nama_barang_or_jasa}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {parseFloat(detail.harga_satuan).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {detail.jumlah_barang || detail.jumlah_jasa}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {parseFloat(detail.dpp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {parseFloat(detail.dpp_nilai_lain).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {parseFloat(detail.ppn).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};