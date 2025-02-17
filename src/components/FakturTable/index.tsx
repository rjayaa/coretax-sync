'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableContent } from './TableContent';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { useFaktur } from '@/hooks/use-faktur';

export const FakturTable = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  
  const { 
    data: fakturData, 
    isLoading, 
    error,
    mutate 
  } = useFaktur(mounted ? undefined : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Memuat daftar faktur..." />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error as Error}
        onRetry={() => mutate()} // Gunakan mutate dari SWR untuk retry
      />
    );
  }

  const fakturs = fakturData?.fakturs || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle>Daftar Faktur Pajak</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Menampilkan {fakturs.length} faktur
              </p>
            </div>
            <Button 
              onClick={() => router.push('/faktur/create')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Buat Faktur Baru
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
       <TableContent 
  fakturs={fakturs} 
  onViewDetail={(path) => router.push(path)} 
/>
      </CardContent>
    </Card>
  );
};