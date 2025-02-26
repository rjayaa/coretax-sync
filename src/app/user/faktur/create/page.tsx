'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import FakturForm from '@/components/FakturForm';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { ArrowLeft, Check, Download, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CreateFakturPage() {
  const router = useRouter();
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleReturn = useCallback(() => {
    if (detailList.length > 0 && !confirm('Perubahan yang belum disimpan akan hilang. Lanjutkan?')) {
      return;
    }
    router.push('/user/faktur');
  }, [router, detailList.length]);

  const handleFakturSubmit = useCallback(async (fakturData: FakturData) => {
    try {
      setIsSaving(true);
      const savedFaktur = await FakturService.saveFaktur(fakturData);
      setCurrentFaktur(savedFaktur);
      
      toast({
        title: "Berhasil",
        description: "Faktur berhasil disimpan",
      });
      
      return savedFaktur;
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan faktur",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
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

  const handleDeleteDetail = useCallback(async (detailId: string) => {
    try {
      await FakturService.deleteDetailFaktur(detailId);
      setDetailList(details => details.filter(d => d.id_detail_faktur !== detailId));
      toast({
        title: "Berhasil",
        description: "Item berhasil dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus item",
        variant: "destructive",
      });
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (currentFaktur) {
      toast({
        title: "Selesai",
        description: "Faktur berhasil dibuat",
      });
      router.push('/user/faktur');
    }
  }, [currentFaktur, router]);

  const handleExportCurrent = useCallback(() => {
    if (currentFaktur && detailList.length > 0) {
      try {
        generateExcelFile([currentFaktur], detailList);
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
    } else {
      toast({
        title: "Perhatian",
        description: "Faktur belum lengkap untuk di-export",
        variant: "default",
      });
    }
  }, [currentFaktur, detailList]);

  return (
    <div className="space-y-4">
      {/* Header dengan judul dan tombol aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Buat Faktur Baru</h1>
          <p className="text-muted-foreground text-sm">Buat faktur pajak baru dan tambahkan item</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleReturn} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          
          {currentFaktur && (
            <>
              <Button 
                onClick={handleExportCurrent} 
                size="sm" 
                variant="outline"
                disabled={!currentFaktur || detailList.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export Excel
              </Button>
              
              <Button 
                onClick={handleFinish} 
                size="sm" 
                variant="default"
                disabled={!currentFaktur}
              >
                <Check className="h-4 w-4 mr-1" />
                Selesai
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Form faktur (3 kolom) */}
        <div className="lg:col-span-3">
          <FakturForm 
            onSubmit={handleFakturSubmit} 
            initialData={currentFaktur || undefined}
          />
        </div>
        
        {/* Form detail faktur (2 kolom) */}
        <div className="lg:col-span-2">
          {currentFaktur ? (
            <DetailFakturForm 
              key={currentFaktur.id}
              fakturId={currentFaktur.id} 
              onSubmit={handleDetailSubmit} 
            />
          ) : (
            <Card className="w-full h-full flex items-center justify-center min-h-[150px]">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Simpan faktur terlebih dahulu</p>
                  <p className="text-sm">untuk menambahkan detail barang/jasa</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detail List dibawah form */}
      {detailList.length > 0 && currentFaktur && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-3">Daftar Item</h2>
          <DetailList
            details={detailList}
            faktur={currentFaktur}
            onDelete={handleDeleteDetail}
          />
        </div>
      )}
    </div>
  );
}