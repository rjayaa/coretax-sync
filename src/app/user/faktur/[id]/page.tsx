'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Download, Printer, Trash2 } from 'lucide-react';
import FakturForm from '@/components/FakturForm';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Fetch faktur data
  const fetchFaktur = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FakturService.getFakturWithDetails(id);
      setFaktur(data.faktur);
      setDetails(data.details);
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

  // Update faktur handler
  const handleUpdateFaktur = useCallback(async (updatedData: FakturData) => {
    try {
      const updatedFaktur = await FakturService.updateFaktur(id, updatedData);
      setFaktur(updatedFaktur);
      setIsEditing(false);
      toast({
        title: 'Berhasil',
        description: 'Faktur berhasil diperbarui',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui faktur',
        variant: 'destructive',
      });
    }
  }, [id]);

  // Add detail handler
  const handleAddDetail = useCallback(async (detailData: DetailFakturData & { id_detail_faktur: string }) => {
    try {
      console.log('Submitting detail data:', detailData);
      const savedDetail = await FakturService.saveDetailFaktur(detailData);
      setDetails(prevDetails => [...prevDetails, savedDetail]);
      toast({
        title: 'Berhasil',
        description: 'Detail faktur berhasil ditambahkan',
      });
    } catch (error) {
      console.error('Error saving detail:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan detail faktur',
        variant: 'destructive',
      });
    }
  }, []);

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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/user/faktur')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Detail Faktur</h1>
          </div>
          <p className="text-muted-foreground">Nomor Faktur: {id}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Batal Edit' : 'Edit Faktur'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEditing ? (
          <FakturForm 
            initialData={faktur}
            isEdit={true}
            onSubmit={handleUpdateFaktur}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Faktur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Faktur</h3>
                  <p>{new Date(faktur.tanggal_faktur).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Jenis Faktur</h3>
                  <p>{faktur.jenis_faktur}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">NPWP Penjual</h3>
                <p>{faktur.npwp_penjual}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pembeli</h3>
                <p className="font-medium">{faktur.nama_pembeli}</p>
                <p className="text-sm">{faktur.npwp_nik_pembeli}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{faktur.alamat_pembeli}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Kode Transaksi</h3>
                <p>{faktur.kode_transaksi}</p>
              </div>
              
              {faktur.keterangan_tambahan && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Keterangan Tambahan</h3>
                  <p>{faktur.keterangan_tambahan}</p>
                </div>
              )}
              
              {faktur.referensi && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Referensi</h3>
                  <p>{faktur.referensi}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <DetailFakturForm 
          fakturId={faktur.id} 
          onSubmit={handleAddDetail} 
        />
      </div>

      {details.length > 0 && (
        <DetailList
          details={details}
          faktur={faktur}
          isEditable={true}
          onRefresh={fetchFaktur}
        />
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