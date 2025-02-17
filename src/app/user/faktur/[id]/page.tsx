// app/faktur/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import FakturForm from '@/components/FakturForm';
import DetailFakturForm from '@/components/FakturForm/DetailFakturForm';
import { DetailList } from '@/components/FakturForm/DetailList';
import { toast } from '@/hooks/use-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function FakturDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [faktur, setFaktur] = useState(null);
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFakturData = async () => {
      try {
        const response = await fetch(`/api/faktur/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch faktur data');
        }
        const data = await response.json();
        setFaktur(data.faktur);
        setDetails(data.details);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error",
          description: "Gagal mengambil data faktur",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFakturData();
  }, [params.id]);

  const handleFakturUpdate = async (updatedData) => {
    try {
      const response = await fetch(`/api/faktur/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update faktur');
      }

      const updatedFaktur = await response.json();
      setFaktur(updatedFaktur);
      toast({
        title: "Berhasil",
        description: "Faktur berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui faktur",
        variant: "destructive",
      });
    }
  };

  const handleDetailSubmit = async (detailData) => {
    try {
      const response = await fetch('/api/detail-faktur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...detailData,
          id_faktur: params.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save detail');
      }

      const savedDetail = await response.json();
      setDetails([...details, savedDetail]);
      toast({
        title: "Berhasil",
        description: "Detail faktur berhasil ditambahkan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan detail faktur",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus faktur ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/faktur/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete faktur');
      }

      toast({
        title: "Berhasil",
        description: "Faktur berhasil dihapus",
      });
      router.push('/faktur');
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus faktur",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingState message="Memuat data faktur..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!faktur) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Faktur tidak ditemukan</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/faktur')}
              className="mt-4"
            >
              Kembali ke Daftar Faktur
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detail Faktur Pajak</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/faktur')}>
                Kembali
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Hapus Faktur
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FakturForm 
              initialData={faktur}
              onSubmit={handleFakturUpdate}
              isEdit
            />
            
            <DetailFakturForm 
              fakturId={params.id}
              onSubmit={handleDetailSubmit}
            />
          </div>

          {details.length > 0 && (
            <div className="mt-8">
              <DetailList details={details} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}