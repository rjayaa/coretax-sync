'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

import FakturForm from '@/components/FakturForm';

import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { generateExcelFile } from '@/utils/excelGenerator';
import { toast } from '@/hooks/use-toast';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';

export default function FakturPage() {
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [fakturList, setFakturList] = useState<(FakturData & { id: string })[]>([]);

  const handleFakturSubmit = async (fakturData: FakturData & { id: string }) => {
    try {
      const savedFaktur = await FakturService.saveFaktur(fakturData);
      setCurrentFaktur(savedFaktur);
      setFakturList([...fakturList, savedFaktur]);
      toast({
        title: "Berhasil",
        description: "Faktur berhasil disimpan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan faktur",
        variant: "destructive",
      });
    }
  };

  const handleDetailSubmit = async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      const savedDetail = await FakturService.saveDetailFaktur(detailData);
      setDetailList([...detailList, savedDetail]);
      toast({
        title: "Berhasil",
        description: "Detail faktur berhasil disimpan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan detail faktur",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      generateExcelFile(fakturList, detailList);
      toast({
        title: "Berhasil",
        description: "File excel berhasil di-generate",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengexport file excel",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Input Faktur Pajak</h1>
        <Button onClick={handleExport} disabled={fakturList.length === 0}>
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FakturForm onSubmit={handleFakturSubmit} />
        
        {currentFaktur && (
          <DetailFakturForm 
            fakturId={currentFaktur.id} 
            onSubmit={handleDetailSubmit} 
          />
        )}
      </div>

      {detailList.length > 0 && (
        <DetailList details={detailList} />
      )}
    </div>
  );
}