// src/app/user/faktur/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FakturForm from '@/components/FakturForm';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import FakturTable from '@/components/FakturTable';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { Plus, FileSpreadsheet } from 'lucide-react';

export default function FakturPage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [fakturList, setFakturList] = useState<(FakturData & { id: string })[]>([]);

  const handleCreateNew = useCallback(() => {
    setActiveTab('create');
    setCurrentFaktur(null);
    setDetailList([]);
  }, []);

  const handleFakturSubmit = useCallback(async (fakturData: FakturData) => {
  try {
    // Remove the id generation from here and let the backend handle it
    const savedFaktur = await FakturService.saveFaktur(fakturData);
    setCurrentFaktur(savedFaktur);
    setFakturList(prevList => [...prevList, savedFaktur]);
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
}, []);

  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      console.log('Submitting detail data:', detailData);
      const savedDetail = await FakturService.saveDetailFaktur(detailData);
      setDetailList(prevList => [...prevList, savedDetail]);
      toast({
        title: "Berhasil",
        description: "Detail faktur berhasil disimpan",
      });
    } catch (error) {
      console.error('Error saving detail:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan detail faktur",
        variant: "destructive",
      });
    }
  }, []);

  const handleExport = useCallback(() => {
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
  }, [fakturList, detailList]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Faktur Pajak</h1>
          <p className="text-muted-foreground">Kelola daftar faktur pajak Anda</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateNew} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Buat Faktur Baru
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={fakturList.length === 0}
            className="whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Daftar Faktur</TabsTrigger>
          <TabsTrigger value="create">Buat Faktur</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <FakturTable onCreateNew={handleCreateNew} />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FakturForm onSubmit={handleFakturSubmit} />
            
            {currentFaktur && (
              <DetailFakturForm 
                key={currentFaktur.id}
                fakturId={currentFaktur.id} 
                onSubmit={handleDetailSubmit} 
              />
            )}
          </div>

          {detailList.length > 0 && currentFaktur && (
            <DetailList
              details={detailList}
              faktur={currentFaktur}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
