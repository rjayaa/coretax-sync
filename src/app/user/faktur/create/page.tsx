
// 'use client';

// import React, { useState, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { FakturService } from '@/services/fakturService';
// import { FakturData, DetailFakturData } from '@/types/faktur';
// import { toast } from '@/hooks/use-toast';
// import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
// import { DetailList } from '@/components/FakturForm/DetailList';
// import FakturForm from '@/components/FakturForm';
// import { generateExcelFile } from '@/lib/utils/excelGenerator';
// import { ArrowLeft, Check, Download, Save, FileUp } from 'lucide-react';
// import { Separator } from '@/components/ui/separator';
// import NomorFakturInput from '@/components/FakturForm/InputNomorFaktur';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// export default function CreateFakturPage() {
//   const router = useRouter();
//   const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
//   const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'faktur' | 'nomorFaktur'>('faktur');

//   const handleReturn = useCallback(() => {
//     if (detailList.length > 0 && !confirm('Perubahan yang belum disimpan akan hilang. Lanjutkan?')) {
//       return;
//     }
//     router.push('/user/faktur');
//   }, [router, detailList.length]);

//   const handleFakturSubmit = useCallback(async (fakturData: FakturData) => {
//     try {
//       setIsSaving(true);
//       const savedFaktur = await FakturService.saveFaktur(fakturData);
//       setCurrentFaktur(savedFaktur);
      
//       toast({
//         title: "Berhasil",
//         description: "Faktur berhasil disimpan",
//       });
      
//       return savedFaktur;
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Gagal menyimpan faktur",
//         variant: "destructive",
//       });
//       return null;
//     } finally {
//       setIsSaving(false);
//     }
//   }, []);

//   const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
//     try {
//       const savedDetail = await FakturService.saveDetailFaktur(detailData);
//       setDetailList(prevList => [...prevList, savedDetail]);
//       toast({
//         title: "Berhasil",
//         description: "Detail faktur berhasil disimpan",
//       });
//     } catch (error) {
//       console.error('Error saving detail:', error);
//       toast({
//         title: "Error",
//         description: "Gagal menyimpan detail faktur",
//         variant: "destructive",
//       });
//     }
//   }, []);

//   const handleDeleteDetail = useCallback(async (detailId: string) => {
//     try {
//       await FakturService.deleteDetailFaktur(detailId);
//       setDetailList(details => details.filter(d => d.id_detail_faktur !== detailId));
//       toast({
//         title: "Berhasil",
//         description: "Item berhasil dihapus",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Gagal menghapus item",
//         variant: "destructive",
//       });
//     }
//   }, []);

//   const handleFinish = useCallback(() => {
//     if (currentFaktur) {
//       toast({
//         title: "Simpan",
//         description: "Faktur berhasil dibuat",
//       });
//       router.push('/user/faktur');
//     }
//   }, [currentFaktur, router]);

//   const handleExportCurrent = useCallback(() => {
//     if (currentFaktur && detailList.length > 0) {
//       try {
//         generateExcelFile([currentFaktur], detailList);
//         toast({
//           title: "Berhasil",
//           description: "File excel berhasil di-generate",
//         });
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: "Gagal mengexport file excel",
//           variant: "destructive",
//         });
//       }
//     } else {
//       toast({
//         title: "Perhatian",
//         description: "Faktur belum lengkap untuk di-export",
//         variant: "default",
//       });
//     }
//   }, [currentFaktur, detailList]);

//   // Handler untuk update nomor faktur
//   const handleNomorFakturUpdate = useCallback((updatedFaktur: any) => {
//     setCurrentFaktur(updatedFaktur);
//     setActiveTab('faktur');
    
//     toast({
//       title: "Berhasil",
//       description: "Nomor faktur pajak berhasil diperbarui",
//     });
//   }, []);

//   return (
//     <div className="space-y-4 container mx-auto px-4">
//       {/* Header dengan judul dan tombol kembali saja */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Buat Faktur Baru</h1>
//           <p className="text-muted-foreground text-sm">Buat faktur pajak baru dan tambahkan item</p>
//         </div>
        
//         <div>
//           <Button onClick={handleReturn} size="sm" variant="outline">
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Kembali
//           </Button>
//         </div>
//       </div>

//       <Separator className="my-2" />

//       {currentFaktur && (
//         <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'faktur' | 'nomorFaktur')} className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-4 max-w-md">
//             <TabsTrigger value="faktur">Form Faktur</TabsTrigger>
//             <TabsTrigger value="nomorFaktur">Input Nomor Faktur</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       )}

//       {/* Content - Conditional rendering berdasarkan active tab */}
//       {activeTab === 'faktur' ? (
//         // Form Faktur Content dengan layout vertikal (stack)
//         <div className="space-y-6">
//           {/* Form Faktur - full width */}
//           <div className="w-full">
//             <FakturForm 
//               onSubmit={handleFakturSubmit} 
//               initialData={currentFaktur || undefined}
//               isEdit={!!currentFaktur}
//             />
//           </div>
          
//           {/* Detail Faktur Form - full width di bawah Faktur Form */}
//           <div className="w-full">
//             {currentFaktur ? (
//               <DetailFakturForm 
//                 key={currentFaktur.id}
//                 fakturId={currentFaktur.id} 
//                 onSubmit={handleDetailSubmit} 
//                 fakturData={currentFaktur}
//               />
//             ) : (
//               <Card className="w-full flex items-center justify-center min-h-[150px]">
//                 <CardContent className="pt-6">
//                   <div className="text-center text-muted-foreground">
//                     <p>Simpan faktur terlebih dahulu</p>
//                     <p className="text-sm">untuk menambahkan detail barang/jasa</p>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
          
//           {/* Detail List dibawah form - full width */}
//           {detailList.length > 0 && currentFaktur && (
//             <div className="w-full mt-4">
//               <h2 className="text-lg font-semibold mb-3">Daftar Item</h2>
//               <DetailList
//                 details={detailList}
//                 faktur={currentFaktur}
//                 onDelete={handleDeleteDetail}
//               />
//             </div>
//           )}
          
//           {/* Tombol-tombol aksi dipindahkan ke bagian bawah Detail List */}
//           {currentFaktur && (
//             <div className="w-full flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t">
//               <Button 
//                 onClick={() => setActiveTab('nomorFaktur')} 
//                 size="md" 
//                 variant="outline"
//                 className="min-w-[180px]"
//               >
//                 <FileUp className="h-4 w-4 mr-2" />
//                 Input Nomor Faktur
//               </Button>
              
//               <Button 
//                 onClick={handleExportCurrent} 
//                 size="md" 
//                 variant="outline"
//                 disabled={!currentFaktur || detailList.length === 0}
//                 className="min-w-[180px]"
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 Export Excel
//               </Button>
              
//               <Button 
//                 onClick={handleFinish} 
//                 size="md" 
//                 variant="default"
//                 disabled={!currentFaktur}
//                 className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
//               >
//                 <Check className="h-4 w-4 mr-2" />
//                 Simpan
//               </Button>
//             </div>
//           )}
//         </div>
//       ) : (
//         // Nomor Faktur Input Content (hanya tampil jika faktur sudah dibuat)
//         currentFaktur && (
//           <div className="max-w-3xl mx-auto">
//             <NomorFakturInput 
//               fakturData={currentFaktur}
//               onSuccess={handleNomorFakturUpdate}
//             />
            
//             <div className="mt-6 text-center text-sm text-muted-foreground">
//               <p>Masukkan nomor faktur pajak yang diperoleh setelah upload ke CoreTax.</p>
//               <p className="mt-1">Untuk mendapatkan nomor faktur pajak, upload data faktur ke sistem CoreTax terlebih dahulu.</p>
//             </div>
//           </div>
//         )
//       )}
//     </div>
//   );
// }

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
import { ArrowLeft, Check, Download, Save, FileUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import NomorFakturInput from '@/components/FakturForm/InputNomorFaktur';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CreateFakturPage() {
  const router = useRouter();
  const [currentFaktur, setCurrentFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [detailList, setDetailList] = useState<DetailFakturData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'faktur' | 'nomorFaktur'>('faktur');
  const [editingDetail, setEditingDetail] = useState<DetailFakturData | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

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
    
    toast({
      title: "Edit Mode",
      description: `Mengedit item: ${detail.nama_barang_or_jasa}`,
    });
  }, []);

  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      // Jika dalam mode edit, hapus item lama terlebih dahulu
      if (editingId) {
        await FakturService.deleteDetailFaktur(editingId);
        
        // Update list dengan menghapus item lama
        setDetailList(prevDetails => prevDetails.filter(d => d.id_detail_faktur !== editingId));
      }
      
      // Simpan detail baru
      const savedDetail = await FakturService.saveDetailFaktur(detailData);
      
      // Update list dengan menambahkan item baru
      setDetailList(prevList => [...prevList, savedDetail]);
      
      // Reset mode edit
      setEditingDetail(null);
      setEditingId(undefined);
      
      toast({
        title: "Berhasil",
        description: editingId ? "Detail faktur berhasil diperbarui" : "Detail faktur berhasil disimpan",
      });
    } catch (error) {
      console.error('Error saving detail:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan detail faktur",
        variant: "destructive",
      });
    }
  }, [editingId]);

  const handleDeleteDetail = useCallback(async (detailId: string) => {
    try {
      await FakturService.deleteDetailFaktur(detailId);
      setDetailList(details => details.filter(d => d.id_detail_faktur !== detailId));
      
      // Reset mode edit jika item yang dihapus adalah yang sedang diedit
      if (editingId === detailId) {
        setEditingDetail(null);
        setEditingId(undefined);
      }
      
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
  }, [editingId]);

  const cancelEdit = useCallback(() => {
    setEditingDetail(null);
    setEditingId(undefined);
    
    toast({
      title: "Edit Dibatalkan",
      description: "Kembali ke mode tambah item",
    });
  }, []);

  const handleFinish = useCallback(() => {
    if (currentFaktur) {
      toast({
        title: "Simpan",
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

  // Handler untuk update nomor faktur
  const handleNomorFakturUpdate = useCallback((updatedFaktur: any) => {
    setCurrentFaktur(updatedFaktur);
    setActiveTab('faktur');
    
    toast({
      title: "Berhasil",
      description: "Nomor faktur pajak berhasil diperbarui",
    });
  }, []);

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

      {currentFaktur && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'faktur' | 'nomorFaktur')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 max-w-md">
            <TabsTrigger value="faktur">Form Faktur</TabsTrigger>
            <TabsTrigger value="nomorFaktur">Input Nomor Faktur</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Content - Conditional rendering berdasarkan active tab */}
      {activeTab === 'faktur' ? (
        // Form Faktur Content dengan layout vertikal (stack)
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
                <DetailFakturForm 
                  key={`${currentFaktur.id}-${editingId || 'new'}`}
                  fakturId={currentFaktur.id} 
                  onSubmit={handleDetailSubmit} 
                  fakturData={currentFaktur}
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
                faktur={currentFaktur}
                onDelete={handleDeleteDetail}
                onEdit={handleEditDetail}
                editingId={editingId}
              />
            </div>
          )}
          
          {/* Tombol-tombol aksi dipindahkan ke bagian bawah Detail List */}
          {currentFaktur && (
            <div className="w-full flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t">
              <Button 
                onClick={() => setActiveTab('nomorFaktur')} 
                size="md" 
                variant="outline"
                className="min-w-[180px]"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Input Nomor Faktur
              </Button>
              
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
              
              <Button 
                onClick={handleFinish} 
                size="md" 
                variant="default"
                disabled={!currentFaktur}
                className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Nomor Faktur Input Content (hanya tampil jika faktur sudah dibuat)
        currentFaktur && (
          <div className="max-w-3xl mx-auto">
            <NomorFakturInput 
              fakturData={currentFaktur}
              onSuccess={handleNomorFakturUpdate}
            />
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Masukkan nomor faktur pajak yang diperoleh setelah upload ke CoreTax.</p>
              <p className="mt-1">Untuk mendapatkan nomor faktur pajak, upload data faktur ke sistem CoreTax terlebih dahulu.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}