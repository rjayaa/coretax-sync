
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import FakturForm from '@/components/FakturForm';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { ArrowLeft, Download, Save, Trash2, Loader2, XCircle, Bug } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EditFakturPageProps {
  params: {
    id: string;
  };
}

export default function EditFakturPage({ params }: EditFakturPageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // State untuk mengelola detail yang sedang diedit
  const [editingDetail, setEditingDetail] = useState<DetailFakturData | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);

  // Fetch faktur data on load
  useEffect(() => {
    const fetchFakturData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch faktur and its details
        const fakturData = await FakturService.getFakturWithDetails(id);
        console.log('Fetched faktur data:', fakturData); // Debug log
        
        setCurrentFaktur(fakturData.faktur);
        setDetailList(fakturData.details);
      } catch (error) {
        console.error('Error fetching faktur data:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data faktur",
          variant: "destructive",
        });
        router.push('/user/faktur');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFakturData();
    }
  }, [id, router]);

  const handleReturn = useCallback(() => {
    router.push('/user/faktur');
  }, [router]);

  const handleFakturSubmit = useCallback(async (fakturData: FakturData) => {
    try {
      setIsSaving(true);
      console.log('Submitting faktur update with data:', fakturData); // Debug log
      
      // Update existing faktur
      const updatedFaktur = await FakturService.updateFaktur(id, fakturData);
      console.log('Received updated faktur data:', updatedFaktur); // Debug log
      
      setCurrentFaktur(updatedFaktur);
      
      toast({
        title: "Berhasil",
        description: "Faktur berhasil diperbarui",
      });
      
      return updatedFaktur;
    } catch (error) {
      console.error('Error updating faktur:', error); // Debug log
      toast({
        title: "Error",
        description: "Gagal memperbarui faktur",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      if (isEditingDetail) {
        console.log('Updating detail with data:', detailData); // Debug log
        
        // Update existing detail
        const updatedDetail = await FakturService.updateDetailFaktur(
          detailData.id_detail_faktur,
          detailData
        );
        
        console.log('Received updated detail data:', updatedDetail); // Debug log
        
        // Update detail in list
        setDetailList(prevList => 
          prevList.map(item => 
            item.id_detail_faktur === updatedDetail.id_detail_faktur ? updatedDetail : item
          )
        );
        
        toast({
          title: "Berhasil",
          description: "Detail transaksi berhasil diperbarui",
        });
        
        // Reset editing state
        setIsEditingDetail(false);
        setEditingDetail(null);
      }
    } catch (error) {
      console.error('Error updating detail:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui detail transaksi",
        variant: "destructive",
      });
    }
  }, [isEditingDetail]);

  const handleEditDetail = useCallback((detail: DetailFakturData) => {
    console.log('Editing detail:', detail); // Debug log
    setEditingDetail(detail);
    setIsEditingDetail(true);
    
    // Scroll to form
    const formElement = document.getElementById('detail-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleCancelEditDetail = useCallback(() => {
    setEditingDetail(null);
    setIsEditingDetail(false);
  }, []);

  const handleDeleteDetail = useCallback(async (detailId: string) => {
    try {
      await FakturService.deleteDetailFaktur(detailId);
      setDetailList(details => details.filter(d => d.id_detail_faktur !== detailId));
      
      // If we were editing this detail, cancel edit mode
      if (editingDetail?.id_detail_faktur === detailId) {
        setEditingDetail(null);
        setIsEditingDetail(false);
      }
      
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi",
        variant: "destructive",
      });
    }
  }, [editingDetail]);

  const handleDeleteFaktur = useCallback(async () => {
    if (!confirm('Apakah Anda yakin akan menghapus faktur ini? Semua detail akan ikut terhapus.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await FakturService.deleteFaktur(id);
      
      toast({
        title: "Berhasil",
        description: "Faktur berhasil dihapus",
      });
      
      router.push('/user/faktur');
    } catch (error) {
      console.error('Error deleting faktur:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus faktur",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [id, router]);

  const handleExportCurrent = useCallback(() => {
    if (currentFaktur) {
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
    }
  }, [currentFaktur, detailList]);

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data faktur...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header dengan judul dan tombol aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Edit Faktur</h1>
          <p className="text-muted-foreground text-sm">Edit faktur dan detail item</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleReturn} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
          
          <Button 
            onClick={handleExportCurrent} 
            size="sm" 
            variant="outline"
            disabled={!currentFaktur}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Excel
          </Button>
          
          <Button
            onClick={() => setShowDebug(!showDebug)}
            size="sm"
            variant="outline"
          >
            <Bug className="h-4 w-4 mr-1" />
            {showDebug ? 'Hide Debug' : 'Debug'}
          </Button>
          
          <Button 
            onClick={handleDeleteFaktur} 
            size="sm" 
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Hapus Faktur
          </Button>
        </div>
      </div>

      <Separator className="my-2" />
      
      {/* Debug Info */}
      {showDebug && currentFaktur && (
        <div className="bg-black text-green-400 p-3 rounded overflow-auto text-xs font-mono">
          <h3 className="text-white mb-2">Current Faktur Data:</h3>
          <pre>{JSON.stringify(currentFaktur, null, 2)}</pre>
          
          <h3 className="text-white mt-4 mb-2">Detail Items ({detailList.length}):</h3>
          <pre>{JSON.stringify(detailList.slice(0, 1), null, 2)}</pre>
        </div>
      )}

      {/* Faktur Form */}
      <div className="mb-6">
        <FakturForm 
          onSubmit={handleFakturSubmit} 
          initialData={currentFaktur || undefined}
          isEdit={true}
          readOnlyCustomer={true} // Data pembeli hanya bisa dibaca, tidak bisa diedit
        />
      </div>

      {/* Detail List */}
      {detailList.length > 0 && currentFaktur && (
        <div className="mb-6">
          <DetailList
            details={detailList}
            faktur={currentFaktur}
            onDelete={handleDeleteDetail}
            onEdit={handleEditDetail}
            editingId={editingDetail?.id_detail_faktur}
          />
        </div>
      )}

      {/* Detail Form - hanya muncul saat mode edit */}
      {isEditingDetail && editingDetail && (
        <div id="detail-form" className="border border-primary/20 rounded-lg p-4 bg-muted/20 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Transaksi</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancelEditDetail}
              className="text-muted-foreground"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Batal Edit
            </Button>
          </div>
          
          <DetailFakturForm 
            key={`edit-${editingDetail.id_detail_faktur}`}
            fakturId={currentFaktur?.id || ''} 
            onSubmit={handleDetailSubmit}
            initialData={editingDetail}
            isEdit={true}
            hideFormTitle={true} // Sembunyikan judul form karena sudah ada di atas
          />
        </div>
      )}
    </div>
  );
}