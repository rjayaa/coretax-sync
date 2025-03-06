
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import FakturTable from '@/components/FakturTable';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FakturListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('main');
  
  // Use ref for faktur list to prevent re-renders
  const fakturListRef = useRef<any[]>([]);

  const handleCreateNew = useCallback(() => {
    router.push('/user/faktur/create');
  }, [router]);

  const handleDataChange = useCallback((data: any[]) => {
    // Update the ref without causing re-renders
    fakturListRef.current = data;
  }, []);

  const handleEditFaktur = useCallback((id: string) => {
    router.push(`/user/faktur/${id}/edit`);
  }, [router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      {/* Header dengan judul dan tombol aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold">Faktur Pajak</h1>
          <p className="text-muted-foreground text-sm">Kelola daftar faktur pajak Anda</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateNew} size="sm" variant="default">
            <Plus className="h-4 w-4 mr-1" />
            Buat Faktur
          </Button>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Tabs */}
      <Tabs defaultValue="main" onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="grid grid-cols-2 w-full h-full max-w-md">
            <TabsTrigger value="main" className="text-base py-3">Data Faktur</TabsTrigger>
            <TabsTrigger value="export" className="text-base py-3">Export Faktur</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="main" className="mt-4">
          <FakturTable 
            onCreateNew={handleCreateNew} 
            onDataChange={handleDataChange}
            onEditFaktur={handleEditFaktur}
            mode="main"
          />
        </TabsContent>
        
        <TabsContent value="export" className="mt-4">
          <FakturTable 
            onCreateNew={handleCreateNew} 
            onDataChange={handleDataChange}
            onEditFaktur={handleEditFaktur}
            mode="export"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}