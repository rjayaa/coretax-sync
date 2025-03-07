
// 'use client';

// import React, { useState, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { FakturService } from '@/services/fakturService';
// import { FakturData, DetailFakturData } from '@/types/faktur';
// import { toast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AlertCircle, ArrowLeft, Download, Printer, Trash2 } from 'lucide-react';
// import FakturForm from '@/components/FakturForm';
// import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
// import { DetailList } from '@/components/FakturForm/DetailList';
// import NomorFakturSection from '@/components/FakturForm/InputNomorFakturEdit';
// import { generateExcelFile } from '@/lib/utils/excelGenerator';
// import { 
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';

// interface FakturDetailPageProps {
//   params: {
//     id: string;
//   };
// }

// export default function FakturDetailPage({ params }: FakturDetailPageProps) {
//   const router = useRouter();
//   const { id } = params;
  
//   const [faktur, setFaktur] = useState<(FakturData & { id: string }) | null>(null);
//   const [details, setDetails] = useState<DetailFakturData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

//   // Fetch faktur data
//   const fetchFaktur = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await FakturService.getFakturWithDetails(id);
//       setFaktur(data.faktur);
//       setDetails(data.details);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching faktur:', err);
//       setError('Failed to load faktur data');
//       setLoading(false);
//       toast({
//         title: 'Error',
//         description: 'Gagal memuat data faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchFaktur();
//   }, [fetchFaktur]);

//   // Handle nomor faktur update
//   const handleNomorFakturUpdate = useCallback((updatedFaktur: FakturData & { id: string }) => {
//     setFaktur(updatedFaktur);
//   }, []);

//   // Update faktur handler
//   const handleUpdateFaktur = useCallback(async (updatedData: FakturData) => {
//     try {
//       const updatedFaktur = await FakturService.updateFaktur(id, updatedData);
//       setFaktur(updatedFaktur);
//       setIsEditing(false);
//       toast({
//         title: 'Berhasil',
//         description: 'Faktur berhasil diperbarui',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal memperbarui faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id]);

//   // Add detail handler
//   const handleAddDetail = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
//     try {
//       console.log('Submitting detail data:', detailData);
//       const savedDetail = await FakturService.saveDetailFaktur(detailData);
//       setDetails(prevDetails => [...prevDetails, savedDetail]);
//       toast({
//         title: 'Berhasil',
//         description: 'Detail faktur berhasil ditambahkan',
//       });
//     } catch (error) {
//       console.error('Error saving detail:', error);
//       toast({
//         title: 'Error',
//         description: 'Gagal menambahkan detail faktur',
//         variant: 'destructive',
//       });
//     }
//   }, []);

//   // Delete detail handler
//   const handleDeleteDetail = useCallback(async (detailId: string) => {
//     try {
//       await FakturService.deleteDetailFaktur(detailId);
//       setDetails(prevDetails => prevDetails.filter(d => d.id_detail_faktur !== detailId));
//       toast({
//         title: 'Berhasil',
//         description: 'Detail faktur berhasil dihapus',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal menghapus detail faktur',
//         variant: 'destructive',
//       });
//     }
//   }, []);

//   // Delete faktur handler
//   const handleDeleteFaktur = useCallback(async () => {
//     try {
//       await FakturService.deleteFaktur(id);
//       toast({
//         title: 'Berhasil',
//         description: 'Faktur berhasil dihapus',
//       });
//       router.push('/user/faktur');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal menghapus faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id, router]);

//   // Export to Excel
//   const handleExport = useCallback(() => {
//     if (!faktur) return;
    
//     try {
//       generateExcelFile([faktur], details);
//       toast({
//         title: 'Berhasil',
//         description: 'File excel berhasil di-generate',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal mengexport file excel',
//         variant: 'destructive',
//       });
//     }
//   }, [faktur, details]);

//   // Show error state
//   if (error) {
//     return (
//       <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
//         <AlertCircle className="h-12 w-12 text-destructive mb-4" />
//         <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
//         <p className="text-muted-foreground mb-6">{error}</p>
//         <div className="flex gap-4">
//           <Button variant="outline" onClick={() => router.push('/user/faktur')}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Kembali
//           </Button>
//           <Button onClick={fetchFaktur}>Coba Lagi</Button>
//         </div>
//       </div>
//     );
//   }

//   // Show loading state
//   if (loading || !faktur) {
//     return (
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <Skeleton className="h-8 w-64 mb-2" />
//             <Skeleton className="h-4 w-48" />
//           </div>
//           <Skeleton className="h-10 w-32" />
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-6 w-48" />
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Array(6).fill(0).map((_, i) => (
//                 <Skeleton key={i} className="h-10 w-full" />
//               ))}
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-6 w-48" />
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Array(6).fill(0).map((_, i) => (
//                 <Skeleton key={i} className="h-10 w-full" />
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               onClick={() => router.push('/user/faktur')}
//               className="h-8 w-8"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <h1 className="text-2xl font-bold">Detail Faktur</h1>
//           </div>
//           <p className="text-muted-foreground">Nomor Faktur: {id}</p>
//         </div>
        
//         <div className="flex flex-wrap gap-2">
//           <Button 
//             variant="outline" 
//             onClick={handleExport}
//           >
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//           <Button 
//             variant="outline"
//             onClick={() => window.print()}
//           >
//             <Printer className="h-4 w-4 mr-2" />
//             Print
//           </Button>
//           <Button 
//             variant="destructive"
//             onClick={() => setDeleteDialogOpen(true)}
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             Hapus
//           </Button>
//           <Button 
//             onClick={() => setIsEditing(!isEditing)}
//           >
//             {isEditing ? 'Batal Edit' : 'Edit Faktur'}
//           </Button>
//         </div>
//       </div>

//       {/* Nomor Faktur Section */}
//       {!isEditing && (
//         <NomorFakturSection 
//           fakturData={faktur} 
//           onSuccess={handleNomorFakturUpdate} 
//         />
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {isEditing ? (
//           <FakturForm 
//             initialData={faktur}
//             isEdit={true}
//             onSubmit={handleUpdateFaktur}
//           />
//         ) : (
//           <Card>
//             <CardHeader>
//               <CardTitle>Informasi Faktur</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Tanggal Faktur</h3>
//                   <p>{new Date(faktur.tanggal_faktur).toLocaleDateString('id-ID')}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Jenis Faktur</h3>
//                   <p>{faktur.jenis_faktur}</p>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">NPWP Penjual</h3>
//                 <p>{faktur.npwp_penjual}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">Pembeli</h3>
//                 <p className="font-medium">{faktur.nama_pembeli}</p>
//                 <p className="text-sm">{faktur.npwp_nik_pembeli}</p>
//                 <p className="text-sm text-muted-foreground whitespace-pre-line">{faktur.alamat_pembeli}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">Kode Transaksi</h3>
//                 <p>{faktur.kode_transaksi}</p>
//               </div>
              
//               {faktur.keterangan_tambahan && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Keterangan Tambahan</h3>
//                   <p>{faktur.keterangan_tambahan}</p>
//                 </div>
//               )}
              
//               {faktur.referensi && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Referensi</h3>
//                   <p>{faktur.referensi}</p>
//                 </div>
//               )}
              
//               {faktur.nomor_faktur_pajak && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Nomor Faktur Pajak</h3>
//                   <p className="font-medium">{faktur.nomor_faktur_pajak}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
        
//         <DetailFakturForm 
//           fakturId={faktur.id} 
//           onSubmit={handleAddDetail} 
//         />
//       </div>

//       {details.length > 0 && (
//         <DetailList
//           details={details}
//           faktur={faktur}
//           isEditable={true}
//           onDelete={handleDeleteDetail}
//           onRefresh={fetchFaktur}
//         />
//       )}
      
//       {/* Delete confirmation dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Hapus Faktur?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
//               Semua data detail faktur juga akan dihapus.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Batal</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={handleDeleteFaktur}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Hapus
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// 'use client';

// import React, { useState, useCallback, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { FakturService } from '@/services/fakturService';
// import { FakturData, DetailFakturData } from '@/types/faktur';
// import { toast } from '@/hooks/use-toast';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AlertCircle, ArrowLeft, Download, Printer, Trash2, Upload } from 'lucide-react';
// import FakturForm from '@/components/FakturForm';
// import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
// import { DetailList } from '@/components/FakturForm/DetailList';
// import NomorFakturSection from '@/components/FakturForm/InputNomorFakturEdit';
// import { generateExcelFile } from '@/lib/utils/excelGenerator';
// import ImportExcelButton from '@/components/FakturForm/ImportCoretaxButton'; // Import komponen baru
// import { 
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { 
//   Sheet, 
//   SheetContent, 
//   SheetDescription, 
//   SheetHeader, 
//   SheetTitle, 
//   SheetTrigger 
// } from "@/components/ui/sheet";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface FakturDetailPageProps {
//   params: {
//     id: string;
//   };
// }

// export default function FakturDetailPage({ params }: FakturDetailPageProps) {
//   const router = useRouter();
//   const { id } = params;
  
//   const [faktur, setFaktur] = useState<(FakturData & { id: string }) | null>(null);
//   const [details, setDetails] = useState<DetailFakturData[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
//   const [editableFields, setEditableFields] = useState<Partial<FakturData>>({});
//   const [editFieldsOpen, setEditFieldsOpen] = useState<boolean>(false);

//   // Fetch faktur data
//   const fetchFaktur = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await FakturService.getFakturWithDetails(id);
//       setFaktur(data.faktur);
//       setDetails(data.details);
//       setEditableFields({
//         nomor_faktur_pajak: data.faktur.nomor_faktur_pajak || '',
//         tanggal_faktur: data.faktur.tanggal_faktur || '',
//         status_faktur: data.faktur.status_faktur || '',
//         referensi: data.faktur.referensi || '',
//       });
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching faktur:', err);
//       setError('Failed to load faktur data');
//       setLoading(false);
//       toast({
//         title: 'Error',
//         description: 'Gagal memuat data faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchFaktur();
//   }, [fetchFaktur]);

//   // Handle nomor faktur update
//   const handleNomorFakturUpdate = useCallback((updatedFaktur: FakturData & { id: string }) => {
//     setFaktur(updatedFaktur);
//     setEditableFields(prev => ({
//       ...prev,
//       nomor_faktur_pajak: updatedFaktur.nomor_faktur_pajak || '',
//     }));
//   }, []);

//   // Update faktur handler
//   const handleUpdateFaktur = useCallback(async (updatedData: FakturData) => {
//     try {
//       const updatedFaktur = await FakturService.updateFaktur(id, updatedData);
//       setFaktur(updatedFaktur);
//       setEditableFields({
//         nomor_faktur_pajak: updatedFaktur.nomor_faktur_pajak || '',
//         tanggal_faktur: updatedFaktur.tanggal_faktur || '',
//         status_faktur: updatedFaktur.status_faktur || '',
//         referensi: updatedFaktur.referensi || '',
//       });
//       setIsEditing(false);
//       toast({
//         title: 'Berhasil',
//         description: 'Faktur berhasil diperbarui',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal memperbarui faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id]);

//   // Handle data imported from Excel
//   const handleDataImported = useCallback((importedData: Partial<FakturData>) => {
//     if (!faktur) return;
    
//     // Update editableFields dengan data dari Excel
//     setEditableFields(prev => ({
//       ...prev,
//       ...importedData
//     }));
    
//     toast({
//       title: 'Berhasil',
//       description: 'Data berhasil diimport dari Excel',
//     });
    
//     // Buka form edit field otomatis
//     setEditFieldsOpen(true);
//   }, [faktur]);

//   // Save editable fields
//   const handleSaveEditableFields = async () => {
//     if (!faktur) return;
    
//     try {
//       // Buat object dengan data faktur yang ada + fields yang sudah diedit
//       const updatedFakturData: FakturData = {
//         ...faktur,
//         ...editableFields
//       };
      
//       const updatedFaktur = await FakturService.updateFaktur(id, updatedFakturData);
//       setFaktur(updatedFaktur);
//       setEditFieldsOpen(false);
      
//       toast({
//         title: 'Berhasil',
//         description: 'Data faktur berhasil diperbarui',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal memperbarui data faktur',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Add detail handler
//   const handleAddDetail = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
//     try {
//       console.log('Submitting detail data:', detailData);
//       const savedDetail = await FakturService.saveDetailFaktur(detailData);
//       setDetails(prevDetails => [...prevDetails, savedDetail]);
//       toast({
//         title: 'Berhasil',
//         description: 'Detail faktur berhasil ditambahkan',
//       });
//     } catch (error) {
//       console.error('Error saving detail:', error);
//       toast({
//         title: 'Error',
//         description: 'Gagal menambahkan detail faktur',
//         variant: 'destructive',
//       });
//     }
//   }, []);

//   // Delete detail handler
//   const handleDeleteDetail = useCallback(async (detailId: string) => {
//     try {
//       await FakturService.deleteDetailFaktur(detailId);
//       setDetails(prevDetails => prevDetails.filter(d => d.id_detail_faktur !== detailId));
//       toast({
//         title: 'Berhasil',
//         description: 'Detail faktur berhasil dihapus',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal menghapus detail faktur',
//         variant: 'destructive',
//       });
//     }
//   }, []);

//   // Delete faktur handler
//   const handleDeleteFaktur = useCallback(async () => {
//     try {
//       await FakturService.deleteFaktur(id);
//       toast({
//         title: 'Berhasil',
//         description: 'Faktur berhasil dihapus',
//       });
//       router.push('/user/faktur');
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal menghapus faktur',
//         variant: 'destructive',
//       });
//     }
//   }, [id, router]);

//   // Export to Excel
//   const handleExport = useCallback(() => {
//     if (!faktur) return;
    
//     try {
//       generateExcelFile([faktur], details);
//       toast({
//         title: 'Berhasil',
//         description: 'File excel berhasil di-generate',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Gagal mengexport file excel',
//         variant: 'destructive',
//       });
//     }
//   }, [faktur, details]);

//   // Fungsi update field yang editable
//   const handleFieldChange = (field: keyof FakturData, value: string) => {
//     setEditableFields(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Show error state
//   if (error) {
//     return (
//       <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
//         <AlertCircle className="h-12 w-12 text-destructive mb-4" />
//         <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
//         <p className="text-muted-foreground mb-6">{error}</p>
//         <div className="flex gap-4">
//           <Button variant="outline" onClick={() => router.push('/user/faktur')}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Kembali
//           </Button>
//           <Button onClick={fetchFaktur}>Coba Lagi</Button>
//         </div>
//       </div>
//     );
//   }

//   // Show loading state
//   if (loading || !faktur) {
//     return (
//       <div className="container mx-auto p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <Skeleton className="h-8 w-64 mb-2" />
//             <Skeleton className="h-4 w-48" />
//           </div>
//           <Skeleton className="h-10 w-32" />
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-6 w-48" />
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Array(6).fill(0).map((_, i) => (
//                 <Skeleton key={i} className="h-10 w-full" />
//               ))}
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-6 w-48" />
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {Array(6).fill(0).map((_, i) => (
//                 <Skeleton key={i} className="h-10 w-full" />
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               onClick={() => router.push('/user/faktur')}
//               className="h-8 w-8"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//             <h1 className="text-2xl font-bold">Detail Faktur</h1>
//           </div>
//           <p className="text-muted-foreground">Nomor Faktur: {id}</p>
//         </div>
        
//         <div className="flex flex-wrap gap-2">
//           {/* Import Excel Button */}
//           <ImportExcelButton 
//             fakturId={id} 
//             onDataImported={handleDataImported} 
//           />
          
//           {/* Edit Fields Button */}
//           <Sheet open={editFieldsOpen} onOpenChange={setEditFieldsOpen}>
//             <SheetTrigger asChild>
//               <Button variant="outline">
//                 <Upload className="h-4 w-4 mr-2" />
//                 Edit Data Faktur
//               </Button>
//             </SheetTrigger>
//             <SheetContent>
//               <SheetHeader>
//                 <SheetTitle>Edit Data Faktur</SheetTitle>
//                 <SheetDescription>
//                   Anda dapat mengubah data faktur di bawah ini. Klik Simpan untuk menyimpan perubahan.
//                 </SheetDescription>
//               </SheetHeader>
//               <div className="space-y-4 py-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="nomor_faktur_pajak">Nomor Faktur Pajak</Label>
//                   <Input 
//                     id="nomor_faktur_pajak" 
//                     value={editableFields.nomor_faktur_pajak || ''}
//                     onChange={(e) => handleFieldChange('nomor_faktur_pajak', e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="tanggal_faktur">Tanggal Faktur</Label>
//                   <Input 
//                     id="tanggal_faktur" 
//                     type="date" 
//                     value={editableFields.tanggal_faktur || ''}
//                     onChange={(e) => handleFieldChange('tanggal_faktur', e.target.value)}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="status_faktur">Status Faktur</Label>
//                   <select 
//                     id="status_faktur" 
//                     className="w-full rounded-md border border-input bg-background px-3 py-2"
//                     value={editableFields.status_faktur || ''}
//                     onChange={(e) => handleFieldChange('status_faktur', e.target.value)}
//                   >
//                     <option value="">Pilih Status</option>
//                     <option value="DRAFT">DRAFT</option>
//                     <option value="APPROVED">APPROVED</option>
//                     <option value="AMENDED">AMENDED</option>
//                     <option value="CANCELLED">CANCELLED</option>
//                   </select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="referensi">Referensi</Label>
//                   <Input 
//                     id="referensi" 
//                     value={editableFields.referensi || ''}
//                     onChange={(e) => handleFieldChange('referensi', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="flex justify-end mt-4 space-x-2">
//                 <Button variant="outline" onClick={() => setEditFieldsOpen(false)}>
//                   Batal
//                 </Button>
//                 <Button onClick={handleSaveEditableFields}>
//                   Simpan Perubahan
//                 </Button>
//               </div>
//             </SheetContent>
//           </Sheet>
          
//           <Button 
//             variant="outline" 
//             onClick={handleExport}
//           >
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </Button>
//           <Button 
//             variant="outline"
//             onClick={() => window.print()}
//           >
//             <Printer className="h-4 w-4 mr-2" />
//             Print
//           </Button>
//           <Button 
//             variant="destructive"
//             onClick={() => setDeleteDialogOpen(true)}
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             Hapus
//           </Button>
//           <Button 
//             onClick={() => setIsEditing(!isEditing)}
//           >
//             {isEditing ? 'Batal Edit' : 'Edit Faktur'}
//           </Button>
//         </div>
//       </div>

//       {/* Nomor Faktur Section */}
//       {!isEditing && (
//         <NomorFakturSection 
//           fakturData={faktur} 
//           onSuccess={handleNomorFakturUpdate} 
//         />
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {isEditing ? (
//           <FakturForm 
//             initialData={faktur}
//             isEdit={true}
//             onSubmit={handleUpdateFaktur}
//           />
//         ) : (
//           <Card>
//             <CardHeader>
//               <CardTitle>Informasi Faktur</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Tanggal Faktur</h3>
//                   <p>{new Date(faktur.tanggal_faktur).toLocaleDateString('id-ID')}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Jenis Faktur</h3>
//                   <p>{faktur.jenis_faktur}</p>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">NPWP Penjual</h3>
//                 <p>{faktur.npwp_penjual}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">Pembeli</h3>
//                 <p className="font-medium">{faktur.nama_pembeli}</p>
//                 <p className="text-sm">{faktur.npwp_nik_pembeli}</p>
//                 <p className="text-sm text-muted-foreground whitespace-pre-line">{faktur.alamat_pembeli}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground">Kode Transaksi</h3>
//                 <p>{faktur.kode_transaksi}</p>
//               </div>
              
//               {faktur.keterangan_tambahan && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Keterangan Tambahan</h3>
//                   <p>{faktur.keterangan_tambahan}</p>
//                 </div>
//               )}
              
//               {faktur.referensi && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Referensi</h3>
//                   <p>{faktur.referensi}</p>
//                 </div>
//               )}
              
//               {faktur.nomor_faktur_pajak && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Nomor Faktur Pajak</h3>
//                   <p className="font-medium">{faktur.nomor_faktur_pajak}</p>
//                 </div>
//               )}
              
//               {faktur.status_faktur && (
//                 <div>
//                   <h3 className="text-sm font-medium text-muted-foreground">Status Faktur</h3>
//                   <p className="font-medium">{faktur.status_faktur}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
        
//         <DetailFakturForm 
//           fakturId={faktur.id} 
//           onSubmit={handleAddDetail} 
//         />
//       </div>

//       {details.length > 0 && (
//         <DetailList
//           details={details}
//           faktur={faktur}
//           isEditable={true}
//           onDelete={handleDeleteDetail}
//           onRefresh={fetchFaktur}
//         />
//       )}
      
//       {/* Delete confirmation dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Hapus Faktur?</AlertDialogTitle>
//             <AlertDialogDescription>
//               Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
//               Semua data detail faktur juga akan dihapus.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Batal</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={handleDeleteFaktur}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Hapus
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }


'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Download, Trash2, FileUp, Check, Upload } from 'lucide-react';
import FakturForm from '@/components/FakturForm';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import NomorFakturInput from '@/components/FakturForm/InputNomorFaktur';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import ImportExcelButton from '@/components/FakturForm/ImportCoretaxButton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import uuidv4 from 'uuidv4';

interface FakturDetailPageProps {
  params: {
    id: string;
  };
}

export default function FakturDetailPage({ params }: FakturDetailPageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [faktur, setFaktur] = useState<(FakturData & { id: string }) | null>(null);
  const [details, setDetails] = useState<DetailFakturData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faktur' | 'nomorFaktur'>('faktur');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [editableFields, setEditableFields] = useState<Partial<FakturData>>({});
  const [editFieldsOpen, setEditFieldsOpen] = useState<boolean>(false);
  const [editingDetail, setEditingDetail] = useState<DetailFakturData | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch faktur data
  const fetchFaktur = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FakturService.getFakturWithDetails(id);
      setFaktur(data.faktur);
      setDetails(data.details);
      setEditableFields({
        nomor_faktur_pajak: data.faktur.nomor_faktur_pajak || '',
        tanggal_faktur: data.faktur.tanggal_faktur || '',
        status_faktur: data.faktur.status_faktur || '',
        referensi: data.faktur.referensi || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching faktur:', err);
      setError('Failed to load faktur data');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Gagal memuat data faktur',
        variant: 'destructive',
      });
    }
  }, [id]);

useEffect(() => {
  fetchFaktur();
}, [fetchFaktur]);

// Tambahkan useEffect ini untuk memastikan editableFields selalu diperbarui saat faktur berubah
useEffect(() => {
  // Inisialisasi dengan data faktur (header)
  if (faktur) {
    // Base fields dari faktur
    const baseFields = {
      nomor_faktur_pajak: faktur.nomor_faktur_pajak || '',
      tanggal_faktur: faktur.tanggal_faktur || '',
      status_faktur: faktur.status_faktur || '',
      referensi: faktur.referensi || '',
    };
    
    // Jika ada detail, tambahkan data dari detail pertama
    if (details.length > 0) {
      const detailData = details[0]; // Ambil detail pertama
      
      setEditableFields({
        ...baseFields,
        // Field-field dari DetailFakturData
        harga_satuan: detailData.harga_satuan || '',
        dpp: detailData.dpp || '',
        dpp_nilai_lain: detailData.dpp_nilai_lain || '',
        ppn: detailData.ppn || '',
      });
    } else {
      // Jika tidak ada detail, hanya set field dari faktur
      setEditableFields(baseFields);
    }
  }
}, [faktur, details]);

  // Handle nomor faktur update
  const handleNomorFakturUpdate = useCallback((updatedFaktur: FakturData & { id: string }) => {
    setFaktur(updatedFaktur);
    setEditableFields(prev => ({
      ...prev,
      nomor_faktur_pajak: updatedFaktur.nomor_faktur_pajak || '',
    }));
    setActiveTab('faktur');
    
    toast({
      title: 'Berhasil',
      description: 'Nomor faktur pajak berhasil diperbarui',
    });
  }, []);

  // Update faktur handler
  const handleUpdateFaktur = useCallback(async (updatedData: FakturData) => {
    try {
      setIsSaving(true);
      const updatedFaktur = await FakturService.updateFaktur(id, updatedData);
      setFaktur(updatedFaktur);
      setEditableFields({
        nomor_faktur_pajak: updatedFaktur.nomor_faktur_pajak || '',
        tanggal_faktur: updatedFaktur.tanggal_faktur || '',
        status_faktur: updatedFaktur.status_faktur || '',
        referensi: updatedFaktur.referensi || '',
      });
      
      toast({
        title: 'Berhasil',
        description: 'Faktur berhasil diperbarui',
      });
      return updatedFaktur;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui faktur',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [id]);

  // Handle data imported from Excel
// Update tipe parameter di props:
// Handler yang benar untuk mengelola data hasil import dari Excel
// Yang bisa meng-update nilai DPP, PPN, DPP Nilai Lain, dll.
// const handleDataImported = useCallback((importedFakturData: Partial<FakturData>, importedDetailData?: Partial<DetailFakturData>[]) => {
//   if (!faktur) return;
  
//   // 1. Update data Faktur ke EditableFields
//   if (Object.keys(importedFakturData).length > 0) {
//     setEditableFields(prev => ({
//       ...prev,
//       ...importedFakturData
//     }));
    
//     // Buka form edit field otomatis untuk faktur header
//     setEditFieldsOpen(true);
    
//     toast({
//       title: 'Berhasil',
//       description: 'Data faktur berhasil diimpor dari Excel',
//     });
//   }
  
//   // 2. Update data detail faktur jika ada
//   if (importedDetailData && importedDetailData.length > 0) {
//     // A. Jika tidak ada detail yang sudah ada, tambahkan sebagai item baru
//     if (details.length === 0) {
//       // Memastikan setiap detail memiliki id_faktur
//       const detailsWithFakturId = importedDetailData.map(detail => ({
//         ...detail,
//         id_faktur: faktur.id
//       }));
      
//       // Simpan ke database dan update state
//       detailsWithFakturId.forEach(async detailItem => {
//         try {
//           const detailWithId = {
//             ...detailItem,
//             id_detail_faktur: detailItem.id_detail_faktur || uuidv4()
//           } as DetailFakturData & { id_detail_faktur: string };
          
//           const savedDetail = await FakturService.saveDetailFaktur(detailWithId);
//           setDetails(prev => [...prev, savedDetail]);
//         } catch (error) {
//           console.error('Error saving imported detail:', error);
//           toast({
//             title: "Error",
//             description: "Gagal menyimpan detail faktur dari Excel",
//             variant: "destructive",
//           });
//         }
//       });
      
//       toast({
//         title: "Berhasil",
//         description: "Detail faktur berhasil ditambahkan dari Excel",
//       });
//     } 
//     // B. Jika sudah ada detail, update item yang sudah ada
//     else {
//       // Simpan detail lama untuk memastikan ada backup
//       const oldDetails = [...details];
      
//       // Buat fungsi updateDetail async
//       const updateDetail = async (detail: DetailFakturData, updateData: Partial<DetailFakturData>) => {
//         try {
//           // Hapus detail lama
//           await FakturService.deleteDetailFaktur(detail.id_detail_faktur);
          
//           // Buat detail baru dengan data yang diupdate
//           const updatedDetail = {
//             ...detail,
//             ...updateData,
//             id_faktur: faktur.id,
//             id_detail_faktur: detail.id_detail_faktur
//           };
          
//           // Simpan detail yang sudah diupdate
//           const savedDetail = await FakturService.saveDetailFaktur(updatedDetail);
          
//           // Update state details dengan menggantikan detail lama
//           setDetails(prev => prev.map(d => 
//             d.id_detail_faktur === detail.id_detail_faktur ? savedDetail : d
//           ));
          
//           return true;
//         } catch (error) {
//           console.error('Error updating detail from Excel:', error);
//           return false;
//         }
//       };
      
//       // Coba update detail pertama dengan data detail pertama dari Excel
//       // Asumsikan item pertama adalah yang ingin diupdate pengguna
//       if (details.length > 0 && importedDetailData.length > 0) {
//         const firstDetail = details[0];
//         const importedDetail = importedDetailData[0];
        
//         // Update nilai-nilai yang kita inginkan (DPP, PPN, dll.)
//         const updateData: Partial<DetailFakturData> = {};
        
//         // Periksa dan isi hanya nilai yang ada di Excel
//         if (importedDetail.dpp !== undefined) updateData.dpp = importedDetail.dpp;
//         if (importedDetail.ppn !== undefined) updateData.ppn = importedDetail.ppn;
//         if (importedDetail.dpp_nilai_lain !== undefined) updateData.dpp_nilai_lain = importedDetail.dpp_nilai_lain;
//         if (importedDetail.harga_satuan !== undefined) updateData.harga_satuan = importedDetail.harga_satuan;
//         if (importedDetail.jumlah_barang_jasa !== undefined) updateData.jumlah_barang_jasa = importedDetail.jumlah_barang_jasa;
//         if (importedDetail.nama_barang_or_jasa !== undefined) updateData.nama_barang_or_jasa = importedDetail.nama_barang_or_jasa;
//         if (importedDetail.kode_barang_or_jasa !== undefined) updateData.kode_barang_or_jasa = importedDetail.kode_barang_or_jasa;
//         if (importedDetail.nama_satuan_ukur !== undefined) updateData.nama_satuan_ukur = importedDetail.nama_satuan_ukur;
//         if (importedDetail.tarif_ppn !== undefined) updateData.tarif_ppn = importedDetail.tarif_ppn;
//         if (importedDetail.ppnbm !== undefined) updateData.ppnbm = importedDetail.ppnbm;
//         if (importedDetail.tarif_ppnbm !== undefined) updateData.tarif_ppnbm = importedDetail.tarif_ppnbm;
//         if (importedDetail.total_diskon !== undefined) updateData.total_diskon = importedDetail.total_diskon;
        
//         // Jika ada data yang akan diupdate
//         if (Object.keys(updateData).length > 0) {
//           updateDetail(firstDetail, updateData).then(success => {
//             if (success) {
//               toast({
//                 title: "Berhasil",
//                 description: "Detail faktur berhasil diperbarui dari Excel",
//               });
              
//               // Jika lebih dari satu detail diimpor, tampilkan pesan
//               if (importedDetailData.length > 1) {
//                 toast({
//                   title: "Perhatian",
//                   description: `${importedDetailData.length - 1} detail tambahan tidak diimpor. Hanya detail pertama yang diupdate.`,
//                   variant: "default",
//                 });
//               }
//             }
//           });
//         }
//       }
//     }
//   }
  // }, [faktur, details]);
  // Handler yang tepat untuk mengimpor data dari Excel CoreTax
// Handler yang tepat untuk mengimpor data dari Excel CoreTax
// Pastikan ini ada di FakturDetailPage.tsx


// const handleDataImported = useCallback(async (importedFakturData: Partial<FakturData>, importedDetailData?: Partial<DetailFakturData>[]) => {
//   if (!faktur) return;
  
//   try {
//     // --- STEP 1: Update data FAKTUR (header) ---
    
//     // Prepare update data (fokus pada nomor_faktur_pajak, status_faktur, referensi dari Excel)
//     let updatedFaktur = faktur;
    
//     if (Object.keys(importedFakturData).length > 0) {
//       // Panggil service untuk update faktur header
//       updatedFaktur = await FakturService.updateFaktur(id, {
//         ...faktur,
//         ...importedFakturData
//       });
      
//       // Update state faktur
//       setFaktur(updatedFaktur);
      
//       console.log('Faktur header updated:', updatedFaktur);
//     }
    
//     // --- STEP 2: Update data DETAIL faktur jika ada ---
    
//     if (importedDetailData && importedDetailData.length > 0) {
//       console.log('Processing detail data from Excel:', importedDetailData[0]);
      
//       // Case A: Sudah ada detail - update nilai-nilai dari detail yang sudah ada
//       if (details.length > 0) {
//         const detailToUpdate = details[0]; // Detail pertama
//         const excelDetail = importedDetailData[0]; // Detail dari Excel
        
//         console.log('Updating existing detail:', detailToUpdate.id_detail_faktur);
        
//         // Prepare update data - tetap pertahankan data yang sudah ada,
//         // hanya perbarui field yang ada di Excel
//         const updatedDetail: DetailFakturData & { id_detail_faktur: string } = {
//           ...detailToUpdate, // Base: semua data existing detail
          
//           // Update dengan nilai dari Excel HANYA jika tersedia di Excel:
//           ...(excelDetail.harga_satuan ? { harga_satuan: excelDetail.harga_satuan } : {}),
//           ...(excelDetail.dpp ? { dpp: excelDetail.dpp } : {}),
//           ...(excelDetail.dpp_nilai_lain ? { dpp_nilai_lain: excelDetail.dpp_nilai_lain } : {}),
//           ...(excelDetail.ppn ? { ppn: excelDetail.ppn } : {}),
//           ...(excelDetail.ppnbm ? { ppnbm: excelDetail.ppnbm } : {}),
          
//           // Pastikan ID tetap sama
//           id_detail_faktur: detailToUpdate.id_detail_faktur,
//           id_faktur: updatedFaktur.id
//         };
        
//         // Apakah ada perubahan pada detail?
//         const hasDetailChanges = 
//           excelDetail.harga_satuan || 
//           excelDetail.dpp || 
//           excelDetail.dpp_nilai_lain || 
//           excelDetail.ppn ||
//           excelDetail.ppnbm;
        
//         // Hanya update jika memang ada perubahan
//         if (hasDetailChanges) {
//           // Delete, lalu create lagi (teknik upsert)
//           await FakturService.deleteDetailFaktur(detailToUpdate.id_detail_faktur);
//           const savedDetail = await FakturService.saveDetailFaktur(updatedDetail);
          
//           // Update state details
//           setDetails(prevDetails => 
//             prevDetails.map(d => d.id_detail_faktur === detailToUpdate.id_detail_faktur ? savedDetail : d)
//           );
          
//           console.log('Detail updated successfully:', savedDetail);
          
//           toast({
//             title: "Berhasil",
//             description: "Nilai DPP, PPN, dan nilai terkait berhasil diperbarui",
//           });
//         } else {
//           console.log('No detail changes detected from Excel');
//         }
//       }
//       // Case B: Belum ada detail - buat detail baru dari data Excel
//       else if (
//         excelDetail.dpp || 
//         excelDetail.ppn || 
//         excelDetail.dpp_nilai_lain || 
//         excelDetail.harga_satuan
//       ) {
//         console.log('Creating new detail from Excel data');
        
//         // Pastikan nilai-nilai wajib ada
//         const newDetail: DetailFakturData & { id_detail_faktur: string } = {
//           id_detail_faktur: uuidv4(),
//           id_faktur: updatedFaktur.id,
//           barang_or_jasa: excelDetail.barang_or_jasa || 'a', // Default 'a' for barang
//           nama_barang_or_jasa: excelDetail.nama_barang_or_jasa || 'Item dari Excel',
//           nama_satuan_ukur: excelDetail.nama_satuan_ukur || 'PCS',
//           jumlah_barang_jasa: excelDetail.jumlah_barang_jasa || '1',
//           harga_satuan: excelDetail.harga_satuan || '0',
//           dpp: excelDetail.dpp || '0',
//           dpp_nilai_lain: excelDetail.dpp_nilai_lain || '0',
//           tarif_ppn: excelDetail.tarif_ppn || '12.00',
//           ppn: excelDetail.ppn || '0',
//           tarif_ppnbm: excelDetail.tarif_ppnbm || '0',
//           ppnbm: excelDetail.ppnbm || '0',
//           total_diskon: excelDetail.total_diskon || '0',
//           kode_barang_or_jasa: excelDetail.kode_barang_or_jasa || '',
//           jumlah_barang: '',
//           jumlah_jasa: ''
//         };
        
//         // Save new detail
//         const savedDetail = await FakturService.saveDetailFaktur(newDetail);
        
//         // Update state details
//         setDetails([savedDetail]);
        
//         console.log('New detail created:', savedDetail);
        
//         toast({
//           title: "Berhasil",
//           description: "Detail faktur baru berhasil ditambahkan",
//         });
//       }
//     }
    
//     // Message untuk user
//     toast({
//       title: 'Berhasil',
//       description: 'Data dari Excel berhasil diimpor',
//     });
    
//     // Buka form edit field untuk melihat perubahan
//     setEditFieldsOpen(true);
    
//   } catch (error) {
//     console.error('Error importing data from Excel:', error);
//     toast({
//       title: "Error",
//       description: "Gagal mengimpor data dari Excel",
//       variant: "destructive",
//     });
//   }
  // }, [faktur, details, id]);
  // Handler untuk mengimpor data Excel dengan mapping yang tepat
const handleDataImported = useCallback(async (importedFakturData: Partial<FakturData>, importedDetailData?: Partial<DetailFakturData>[]) => {
  if (!faktur) return;
  
  try {
    // --- STEP 1: Persiapkan data untuk ditampilkan di form edit ---
    const editFields: any = {};
    
    // Ambil data Faktur Header (nomor_faktur_pajak, status_faktur, dll)
    if (Object.keys(importedFakturData).length > 0) {
      // Header fields dari Excel
      if (importedFakturData.nomor_faktur_pajak) editFields.nomor_faktur_pajak = importedFakturData.nomor_faktur_pajak;
      if (importedFakturData.status_faktur) editFields.status_faktur = importedFakturData.status_faktur;
      if (importedFakturData.tanggal_faktur) editFields.tanggal_faktur = importedFakturData.tanggal_faktur;
      if (importedFakturData.referensi) editFields.referensi = importedFakturData.referensi;
    }
    
    // Ambil data Detail Faktur (harga_satuan, dpp, dpp_nilai_lain, ppn)
    if (importedDetailData && importedDetailData.length > 0) {
      const excelDetail = importedDetailData[0];
      
      // MAPPING YANG BENAR:
      
      // 1. harga_satuan = Harga Jual/Penggantian/DPP
      if (excelDetail.harga_satuan) {
        editFields.harga_satuan = excelDetail.harga_satuan;
      }
      
      // 2. dpp = Harga Jual/Penggantian/DPP (sama dengan harga_satuan)
      if (excelDetail.dpp || excelDetail.harga_satuan) {
        editFields.dpp = excelDetail.dpp || excelDetail.harga_satuan;
      }
      
      // 3. dpp_nilai_lain = DPP Nilai Lain/DPP
      if (excelDetail.dpp_nilai_lain) {
        editFields.dpp_nilai_lain = excelDetail.dpp_nilai_lain;
      }
      
      // 4. ppn = PPN
      if (excelDetail.ppn) {
        editFields.ppn = excelDetail.ppn;
      }
    }
    
    // Update editableFields dengan data dari Excel
    setEditableFields(prev => ({
      ...prev,
      ...editFields
    }));
    
    // Buka form edit field untuk melihat dan mengedit nilai-nilai yang diimpor
    setEditFieldsOpen(true);
    
    toast({
      title: 'Berhasil',
      description: 'Data dari Excel berhasil diimpor. Periksa dan simpan perubahan.',
    });
    
  } catch (error) {
    console.error('Error importing data from Excel:', error);
    toast({
      title: "Error",
      description: "Gagal mengimpor data dari Excel",
      variant: "destructive",
    });
  }
}, [faktur]);
  // Save editable fields
  const handleSaveEditableFields = async () => {
    if (!faktur) return;
    
    try {
      setIsSaving(true);
      // Buat object dengan data faktur yang ada + fields yang sudah diedit
      const updatedFakturData: FakturData = {
        ...faktur,
        ...editableFields
      };
      
      const updatedFaktur = await FakturService.updateFaktur(id, updatedFakturData);
      setFaktur(updatedFaktur);
      setEditFieldsOpen(false);
      
      toast({
        title: 'Berhasil',
        description: 'Data faktur berhasil diperbarui',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui data faktur',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle edit detail
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

  // Cancel edit detail
  const cancelEdit = useCallback(() => {
    setEditingDetail(null);
    setEditingId(undefined);
    
    toast({
      title: "Edit Dibatalkan",
      description: "Kembali ke mode tambah item",
    });
  }, []);

  // Add/update detail handler
  const handleDetailSubmit = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      // Jika dalam mode edit, hapus item lama terlebih dahulu
      if (editingId) {
        await FakturService.deleteDetailFaktur(editingId);
        
        // Update list dengan menghapus item lama
        setDetails(prevDetails => prevDetails.filter(d => d.id_detail_faktur !== editingId));
      }
      
      // Simpan detail baru
      const savedDetail = await FakturService.saveDetailFaktur(detailData);
      
      // Update list dengan menambahkan item baru
      setDetails(prevList => [...prevList, savedDetail]);
      
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

  // Delete detail handler
  const handleDeleteDetail = useCallback(async (detailId: string) => {
    try {
      await FakturService.deleteDetailFaktur(detailId);
      setDetails(details => details.filter(d => d.id_detail_faktur !== detailId));
      
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

  // Delete faktur handler
  const handleDeleteFaktur = useCallback(async () => {
    try {
      await FakturService.deleteFaktur(id);
      toast({
        title: 'Berhasil',
        description: 'Faktur berhasil dihapus',
      });
      router.push('/user/faktur');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus faktur',
        variant: 'destructive',
      });
    }
  }, [id, router]);

  // Export to Excel
  const handleExport = useCallback(() => {
    if (!faktur) return;
    
    try {
      generateExcelFile([faktur], details);
      toast({
        title: 'Berhasil',
        description: 'File excel berhasil di-generate',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengexport file excel',
        variant: 'destructive',
      });
    }
  }, [faktur, details]);

  // Fungsi update field yang editable
  const handleFieldChange = (field: keyof FakturData, value: string) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Handler untuk menyimpan perubahan dengan penanganan data Excel yang tepat
const handleSaveChanges = async () => {
  if (!faktur) return;
  
  setIsSaving(true);
  
  try {
    // STEP 1: Persiapkan data untuk update
    
    // -- 1.1 Data faktur header
    const fakturUpdates: Partial<FakturData> = {
      nomor_faktur_pajak: editableFields.nomor_faktur_pajak || faktur.nomor_faktur_pajak,
      tanggal_faktur: editableFields.tanggal_faktur || faktur.tanggal_faktur,
      status_faktur: editableFields.status_faktur || faktur.status_faktur,
      referensi: editableFields.referensi || faktur.referensi,
    };
    
    // -- 1.2 Data detail faktur
    let detailUpdates: Partial<DetailFakturData> = {};
    
    // Ambil nilai-nilai detail dari editableFields
    if ('harga_satuan' in editableFields) detailUpdates.harga_satuan = editableFields.harga_satuan;
    if ('dpp' in editableFields) detailUpdates.dpp = editableFields.dpp;
    if ('dpp_nilai_lain' in editableFields) detailUpdates.dpp_nilai_lain = editableFields.dpp_nilai_lain;
    if ('ppn' in editableFields) detailUpdates.ppn = editableFields.ppn;
    
    // STEP 2: Update faktur header
    const updatedFaktur = await FakturService.updateFaktur(id, {
      ...faktur,
      ...fakturUpdates
    });
    
    // Update state faktur
    setFaktur(updatedFaktur);
    console.log('Faktur header updated:', updatedFaktur);
    
    // STEP 3: Update detail faktur (jika ada detail dan ada perubahan)
    if (details.length > 0 && Object.keys(detailUpdates).length > 0) {
      const detailToUpdate = details[0]; // Ambil detail pertama
      
      // Persiapkan data lengkap untuk update
      const updatedDetailData: DetailFakturData & { id_detail_faktur: string } = {
        ...detailToUpdate, // Base data = data existing
        ...detailUpdates, // Overwrite dengan data dari form
        id_detail_faktur: detailToUpdate.id_detail_faktur,
        id_faktur: updatedFaktur.id
      };
      
      try {
        // Update dengan metode delete -> create (upsert)
        await FakturService.deleteDetailFaktur(detailToUpdate.id_detail_faktur);
        const savedDetail = await FakturService.saveDetailFaktur(updatedDetailData);
        
        // Update state details
        setDetails(prevDetails => 
          prevDetails.map(d => d.id_detail_faktur === detailToUpdate.id_detail_faktur ? savedDetail : d)
        );
        
        console.log('Detail updated successfully:', savedDetail);
      } catch (error) {
        console.error('Error updating detail:', error);
        throw error;
      }
    }
    // Jika tidak ada detail tapi ada data nilai dari Excel, buat detail baru
    else if (details.length === 0 && Object.keys(detailUpdates).length > 0) {
      // Minimal data yang diperlukan untuk membuat detail baru
      const newDetail: DetailFakturData & { id_detail_faktur: string } = {
        id_detail_faktur: uuidv4(),
        id_faktur: updatedFaktur.id,
        barang_or_jasa: 'a', // Default to goods
        nama_barang_or_jasa: 'Item dari Excel',
        nama_satuan_ukur: 'PCS', // Default satuan
        harga_satuan: detailUpdates.harga_satuan || '0',
        jumlah_barang_jasa: '1', // Default quantity
        dpp: detailUpdates.dpp || detailUpdates.harga_satuan || '0',
        dpp_nilai_lain: detailUpdates.dpp_nilai_lain || '0',
        ppn: detailUpdates.ppn || '0',
        tarif_ppn: '12.00', // Default PPN rate
        ppnbm: '0',
        tarif_ppnbm: '0',
        total_diskon: '0',
        kode_barang_or_jasa: '',
        jumlah_barang: '',
        jumlah_jasa: ''
      };
      
      try {
        // Simpan detail baru
        const savedDetail = await FakturService.saveDetailFaktur(newDetail);
        
        // Update state details
        setDetails([savedDetail]);
        
        console.log('New detail created from Excel data:', savedDetail);
      } catch (error) {
        console.error('Error creating new detail:', error);
        throw error;
      }
    }
    
    // Tutup form edit
    setEditFieldsOpen(false);
    
    // Notifikasi sukses
    toast({
      title: 'Berhasil',
      description: 'Data faktur dan nilai berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error saving changes:', error);
    toast({
      title: 'Error',
      description: 'Gagal menyimpan perubahan',
      variant: 'destructive',
    });
  } finally {
    setIsSaving(false);
  }
};

// Handler umum untuk semua field
// const handleFieldChange = (field: string, value: string) => {
//   setEditableFields(prev => ({
//     ...prev,
//     [field]: value
//   }));
// };

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push('/user/faktur')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button onClick={fetchFaktur}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || !faktur) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="space-y-4 pt-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 container mx-auto px-4">
      {/* Header dengan judul dan tombol kembali */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Edit Faktur</h1>
          <p className="text-muted-foreground text-sm">Edit faktur pajak dengan ID: {id}</p>
        </div>
        
        <div>
          <Button onClick={() => router.push('/user/faktur')} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Tabs untuk navigasi antara Form Faktur dan Input Nomor Faktur */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'faktur' | 'nomorFaktur')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 max-w-md">
          <TabsTrigger value="faktur">Form Faktur</TabsTrigger>
          <TabsTrigger value="nomorFaktur">Input Nomor Faktur</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content - Conditional rendering berdasarkan active tab */}
      {activeTab === 'faktur' ? (
        // Form Faktur Content dengan layout vertikal (stack) - sama seperti CreateFakturPage
        <div className="space-y-6">
          {/* Form Faktur - full width */}
          <div className="w-full">
            <FakturForm 
              onSubmit={handleUpdateFaktur} 
              initialData={faktur}
              isEdit={true}
            />
          </div>
          
          {/* Detail Faktur Form - full width di bawah Faktur Form */}
          <div id="detail-form-section" className="w-full">
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
                key={`${faktur.id}-${editingId || 'new'}`}
                fakturId={faktur.id} 
                onSubmit={handleDetailSubmit} 
                fakturData={faktur}
                initialData={editingDetail || undefined}
                isEdit={!!editingDetail}
              />
            </div>
          </div>
          
          {/* Detail List dibawah form - full width */}
          {details.length > 0 && (
            <div className="w-full mt-4">
              <h2 className="text-lg font-semibold mb-3">Daftar Item</h2>
              <DetailList
                details={details}
                faktur={faktur}
                onDelete={handleDeleteDetail}
                onEdit={handleEditDetail}
                editingId={editingId}
              />
            </div>
          )}
          
          {/* Tombol-tombol aksi di bagian bawah */}
          <div className="w-full flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t">
            {/* Import Excel Button */}
            <ImportExcelButton 
              fakturId={id} 
              onDataImported={handleDataImported} 
            />
            
            {/* Sheet untuk Edit Fields */}
           {/* Sheet untuk Edit Fields - dengan penanganan data faktur dan detail yang benar */}
{/* Sheet Edit yang bisa menampilkan data dari Excel dengan benar */}
<Sheet open={editFieldsOpen} onOpenChange={setEditFieldsOpen}>
  <SheetTrigger asChild>
    <Button variant="outline">
      <Upload className="h-4 w-4 mr-2" />
      Edit Data Faktur
    </Button>
  </SheetTrigger>
  <SheetContent className="sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Edit Data Faktur</SheetTitle>
      <SheetDescription>
        Data dari Excel telah dimuat. Periksa dan simpan perubahan.
      </SheetDescription>
    </SheetHeader>
    
    <div className="space-y-4 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* 1. BAGIAN FAKTUR HEADER */}
      <div className="border-b pb-4 mb-4">
        <h3 className="text-sm font-medium mb-2">Data Faktur</h3>
        
        {/* Nomor Faktur Pajak */}
        <div className="space-y-2">
          <Label htmlFor="nomor_faktur_pajak">Nomor Faktur Pajak</Label>
          <Input 
            id="nomor_faktur_pajak" 
            value={editableFields.nomor_faktur_pajak || ''}
            onChange={(e) => handleFieldChange('nomor_faktur_pajak', e.target.value)}
          />
        </div>

        {/* Tanggal Faktur */}
        <div className="space-y-2">
          <Label htmlFor="tanggal_faktur">Tanggal Faktur</Label>
          <Input 
            id="tanggal_faktur" 
            type="date" 
            value={editableFields.tanggal_faktur || ''}
            onChange={(e) => handleFieldChange('tanggal_faktur', e.target.value)}
          />
        </div>

        {/* Status Faktur */}
        <div className="space-y-2">
          <Label htmlFor="status_faktur">Status Faktur</Label>
          <select 
            id="status_faktur" 
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={editableFields.status_faktur || ''}
            onChange={(e) => handleFieldChange('status_faktur', e.target.value)}
          >
            <option value="">Pilih Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="APPROVED">APPROVED</option>
            <option value="AMENDED">AMENDED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Referensi */}
        <div className="space-y-2">
          <Label htmlFor="referensi">Referensi</Label>
          <Input 
            id="referensi" 
            value={editableFields.referensi || ''}
            onChange={(e) => handleFieldChange('referensi', e.target.value)}
          />
        </div>
      </div>
      
      {/* 2. BAGIAN DETAIL FAKTUR */}
      <div>
        <h3 className="text-sm font-medium mb-2">Data Nilai</h3>
        
        {/* Harga Satuan = Harga Jual/Penggantian/DPP */}
        <div className="space-y-2">
          <Label htmlFor="harga_satuan">Harga Jual/Penggantian/DPP</Label>
          <Input 
            id="harga_satuan" 
            value={editableFields.harga_satuan || ''}
            onChange={(e) => handleFieldChange('harga_satuan', e.target.value)}
          />
        </div>

        {/* DPP = Harga Jual/Penggantian/DPP (sama dengan harga_satuan) */}
        <div className="space-y-2">
          <Label htmlFor="dpp">DPP</Label>
          <Input 
            id="dpp" 
            value={editableFields.dpp || editableFields.harga_satuan || ''}
            onChange={(e) => handleFieldChange('dpp', e.target.value)}
          />
        </div>

        {/* DPP Nilai Lain = DPP Nilai Lain/DPP */}
        <div className="space-y-2">
          <Label htmlFor="dpp_nilai_lain">DPP Nilai Lain</Label>
          <Input 
            id="dpp_nilai_lain" 
            value={editableFields.dpp_nilai_lain || ''}
            onChange={(e) => handleFieldChange('dpp_nilai_lain', e.target.value)}
          />
        </div>

        {/* PPN = PPN */}
        <div className="space-y-2">
          <Label htmlFor="ppn">PPN</Label>
          <Input 
            id="ppn" 
            value={editableFields.ppn || ''}
            onChange={(e) => handleFieldChange('ppn', e.target.value)}
          />
        </div>
      </div>
    </div>
    
    <div className="flex justify-end mt-4 space-x-2">
      <Button variant="outline" onClick={() => setEditFieldsOpen(false)}>
        Batal
      </Button>
      <Button onClick={handleSaveChanges} disabled={isSaving}>
        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </div>
  </SheetContent>
</Sheet>
            
            {/* <Button 
              onClick={() => setActiveTab('nomorFaktur')} 
              size="md" 
              variant="outline"
              className="min-w-[180px]"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Input Nomor Faktur
            </Button> */}
            
            <Button 
              onClick={handleExport} 
              size="md" 
              variant="outline"
              disabled={details.length === 0}
              className="min-w-[180px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            
            <Button 
              onClick={() => setDeleteDialogOpen(true)}
              size="md" 
              variant="destructive"
              className="min-w-[180px]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Faktur
            </Button>
            
            <Button 
              onClick={() => router.push('/user/faktur')}
              size="md" 
              variant="default"
              className="min-w-[180px] bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Selesai
            </Button>
          </div>
        </div>
      ) : (
        // Nomor Faktur Input Content
        <div className="max-w-3xl mx-auto">
          <NomorFakturInput 
            fakturData={faktur}
            onSuccess={handleNomorFakturUpdate}
          />
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Masukkan nomor faktur pajak yang diperoleh setelah upload ke CoreTax.</p>
            <p className="mt-1">Untuk mendapatkan nomor faktur pajak, upload data faktur ke sistem CoreTax terlebih dahulu.</p>
          </div>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Faktur?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
              Semua data detail faktur juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFaktur}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}