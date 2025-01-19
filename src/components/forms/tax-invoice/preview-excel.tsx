// src/components/forms/tax-invoice/preview-excel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Table } from "lucide-react";
import type { FakturData, DetailItem } from "@/types/tax-invoice";

interface PreviewExcelProps {
  fakturData: FakturData;
  detailItems: DetailItem[];
  onGenerateExcel: () => void;
}

export default function PreviewExcel({
  fakturData,
  detailItems,
  onGenerateExcel
}: PreviewExcelProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={onGenerateExcel} className="flex-1">
          <Table className="mr-2 h-4 w-4" />
          Download Excel Rekap
        </Button>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">Preview Data Rekap</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Baris</th>
                <th className="border p-2 text-left">Tanggal</th>
                <th className="border p-2 text-left">Nama Pembeli</th>
                <th className="border p-2 text-left">NPWP</th>
                <th className="border p-2 text-right">DPP</th>
                <th className="border p-2 text-right">PPN</th>
                <th className="border p-2 text-right">PPnBM</th>
              </tr>
            </thead>
            <tbody>
              {detailItems.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{fakturData.tanggalFaktur}</td>
                  <td className="border p-2">{fakturData.namaPembeli}</td>
                  <td className="border p-2">{fakturData.npwpPembeli}</td>
                  <td className="border p-2 text-right">
                    {Number(item.dpp).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border p-2 text-right">
                    {Number(item.ppn).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border p-2 text-right">
                    {Number(item.ppnbm).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td colSpan={4} className="border p-2 text-right">Total:</td>
                <td className="border p-2 text-right">
                  {detailItems.reduce((sum, item) => sum + Number(item.dpp), 0)
                    .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </td>
                <td className="border p-2 text-right">
                  {detailItems.reduce((sum, item) => sum + Number(item.ppn), 0)
                    .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </td>
                <td className="border p-2 text-right">
                  {detailItems.reduce((sum, item) => sum + Number(item.ppnbm), 0)
                    .toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}