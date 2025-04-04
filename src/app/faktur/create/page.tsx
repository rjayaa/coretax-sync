
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FakturData, DetailFakturData } from '@/types/faktur';
import DetailFakturForm from '@/components/DetailFakturForm';
import { DetailList } from '@/components/DetailList';
import FakturForm from '@/components/FakturForm';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { ArrowLeft, Check, Download, Save, FileUp, Paperclip } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function CreateFakturPage() {
  const router = useRouter();
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDetail, setEditingDetail] = useState<DetailFakturData | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleReturn = useCallback(() => {
    if (detailList.length > 0 && !confirm('Perubahan yang belum disimpan akan hilang. Lanjutkan?')) {
      return;
    }
    router.push('/faktur');
  }, [router, detailList.length]);

  const handleFakturSubmit = useCallback(async (fakturData: FakturData, files?: File[]) => {
    try {
      setIsSaving(true);
      
      // Simpan referensi file untuk upload nanti jika diperlukan
      if (files && files.length > 0) {
        setSelectedFiles(files);
      }
      
      // Kirim data ke backend via API
      const response = await fetch('/api/faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fakturData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan faktur');
      }
      
      const savedFaktur = await response.json();
      setCurrentFaktur(savedFaktur);
      
      // Upload files jika ada
      if (files && files.length > 0) {
        try {
          setUploadingFiles(true);
          
          // Upload each file one by one
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', ''); // Optional description
            
            const fileResponse = await fetch(`/api/faktur/${savedFaktur.id}/attachments`, {
              method: 'POST',
              body: formData,
            });
            
            if (!fileResponse.ok) {
              console.error('Failed to upload file:', file.name);
              // Continue even if one file fails
            }
          }
          
          // Clear selected files after upload
          setSelectedFiles([]);
          toast.success("File lampiran berhasil diupload");
        } catch (err) {
          console.error('Error uploading files:', err);
          toast.error("Gagal mengupload beberapa file");
        } finally {
          setUploadingFiles(false);
        }
      }
      
      toast.success("Faktur berhasil disimpan");
      
      return savedFaktur;
    } catch (error) {
      console.error('Error saving faktur:', error);
      toast.error("Gagal menyimpan faktur");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleEditDetail = useCallback((detail: DetailFakturData) => {
    // Scroll ke form detail
    setTimeout(() => {
      const detailFormElement = document.getElementById('detail-form-section');
      if (detailFormElement) {
        detailFormElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // Set detail yang akan diedit
    setEditingDetail(detail);
    setEditingId(detail.id_detail_faktur);
    
    toast.info(`Mengedit item: ${detail.nama_barang_or_jasa}`);
  }, []);

  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      const apiUrl = '/api/detail-faktur';
      const method = 'POST';
      
      // Kirim data ke backend via API
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan detail faktur');
      }
      
      const savedDetail = await response.json();
      
      if (editingId) {
        // Update list dengan menghapus item lama
        setDetailList(prevDetails => prevDetails.filter(d => d.id_detail_faktur !== editingId));
      }
      
      // Update list dengan menambahkan item baru/update
      setDetailList(prevList => [...prevList, savedDetail]);
      
      // Reset mode edit
      setEditingDetail(null);
      setEditingId(undefined);
      
      toast.success(editingId ? "Detail faktur berhasil diperbarui" : "Detail faktur berhasil disimpan");
      
      return savedDetail;
    } catch (error) {
      console.error('Error saving detail:', error);
      toast.error("Gagal menyimpan detail faktur");
      return null;
    }
  }, [editingId]);

  const handleDeleteDetail = useCallback(async (detailId: string) => {
    try {
      // Konfirmasi penghapusan
      if (!confirm('Yakin ingin menghapus item ini?')) {
        return;
      }
      
      // Kirim permintaan hapus ke backend
      const response = await fetch(`/api/detail-faktur/${detailId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus item');
      }
      
      // Update list dengan menghapus item
      setDetailList(details => details.filter(d => d.id_detail_faktur !== detailId));
      
      // Reset mode edit jika item yang dihapus adalah yang sedang diedit
      if (editingId === detailId) {
        setEditingDetail(null);
        setEditingId(undefined);
      }
      
      toast.success("Item berhasil dihapus");
    } catch (error) {
      console.error('Error deleting detail:', error);
      toast.error("Gagal menghapus item");
    }
  }, [editingId]);

  const cancelEdit = useCallback(() => {
    setEditingDetail(null);
    setEditingId(undefined);
    
    toast.info("Kembali ke mode tambah item");
  }, []);

  const handleFinish = useCallback(() => {
    if (currentFaktur) {
      toast.success("Faktur berhasil dibuat");
      router.push('/faktur');
    }
  }, [currentFaktur, router]);

  const handleExportCurrent = useCallback(() => {
    if (currentFaktur && detailList.length > 0) {
      try {
        generateExcelFile([currentFaktur], detailList);
        toast.success("File excel berhasil di-generate");
      } catch (error) {
        console.error('Error exporting to excel:', error);
        toast.error("Gagal mengexport file excel");
      }
    } else {
      toast.info("Faktur belum lengkap untuk di-export");
    }
  }, [currentFaktur, detailList]);

  // Upload file handler jika perlu tambahan upload file setelah faktur dibuat
  const uploadAdditionalFiles = useCallback(async (files: File[]) => {
    if (!currentFaktur || files.length === 0) return;
    
    try {
      setUploadingFiles(true);
      
      // Upload each file one by one
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', '');
        
        const fileResponse = await fetch(`/api/faktur/${currentFaktur.id}/attachments`, {
          method: 'POST',
          body: formData,
        });
        
        if (!fileResponse.ok) {
          console.error('Failed to upload file:', file.name);
        }
      }
      
      toast.success("File lampiran berhasil diupload");
    } catch (err) {
      console.error('Error uploading files:', err);
      toast.error("Gagal mengupload file");
    } finally {
      setUploadingFiles(false);
    }
  }, [currentFaktur]);

  return (
    <div className="space-y-4 container mx-auto px-4">
      {/* Header dengan judul dan tombol kembali saja */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Buat Faktur Baru</h1>
          <p className="text-muted-foreground text-sm">Buat faktur pajak baru dan tambahkan item</p>
        </div>
        
        <div>
          <Button onClick={handleReturn} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Content - Form dan Detail Items */}
      <div className="space-y-6">
        {/* Form Faktur - full width */}
        <div className="w-full">
          <FakturForm 
            onSubmit={handleFakturSubmit} 
            initialData={currentFaktur || undefined}
            isEdit={!!currentFaktur}
          />
        </div>
        
        {/* Detail Faktur Form - full width di bawah Faktur Form */}
        <div id="detail-form-section" className="w-full">
         {currentFaktur ? (
  <div className="relative">
    {editingDetail && (
      <div className="absolute right-4 top-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={cancelEdit}
          className="text-muted-foreground"
        >
          Batal Edit
        </Button>
      </div>
    )}
    {/* 1. Use a stable key that doesn't change with every edit */}
    {/* 2. Only remount when switching between edit/add modes */}
    <DetailFakturForm 
      key={editingDetail ? `edit-${currentFaktur.id}` : `add-${currentFaktur.id}`}
      fakturId={currentFaktur.id} 
      onSubmit={handleDetailSubmit} 
      initialData={editingDetail || undefined}
      isEdit={!!editingDetail}
    />
  </div>
) : (
  <Card className="w-full flex items-center justify-center min-h-[150px]">
    <CardContent className="pt-6">
      <div className="text-center text-muted-foreground">
        <p>Simpan faktur terlebih dahulu</p>
        <p className="text-sm">untuk menambahkan detail barang/jasa</p>
      </div>
    </CardContent>
  </Card>
          )}
          </div>
        
        {/* Detail List dibawah form - full width */}
        {detailList.length > 0 && currentFaktur && (
          <div className="w-full mt-4">
            <h2 className="text-lg font-semibold mb-3">Daftar Item</h2>
            <DetailList
              details={detailList}
              onDelete={handleDeleteDetail}
              onEdit={handleEditDetail}
              editingId={editingId}
            />
          </div>
        )}
        
        {/* File Upload Status */}
        {uploadingFiles && (
          <div className="w-full bg-blue-50 p-4 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              <p className="text-blue-700">Mengupload file lampiran...</p>
            </div>
          </div>
        )}
        
        {/* Tombol-tombol aksi dipindahkan ke bagian bawah Detail List */}
        {currentFaktur && (
          <div className="w-full flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t">
            {/* Upload Lampiran Tambahan Button jika faktur sudah dibuat */}
            <label className="cursor-pointer">
              <Button 
                type="button"
                variant="outline"
                disabled={!currentFaktur}
                className="min-w-[180px]"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf,.jpg,.jpeg,.png';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) {
                      uploadAdditionalFiles(Array.from(target.files));
                    }
                  };
                  input.click();
                }}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Tambah Lampiran
              </Button>
            </label>
            
            <Button 
              onClick={handleExportCurrent} 
              size="md" 
              variant="outline"
              disabled={!currentFaktur || detailList.length === 0}
              className="min-w-[180px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            
            {/* <Button 
              onClick={handleFinish} 
              size="md" 
              variant="default"
              disabled={!currentFaktur}
              className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Simpan
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
}

