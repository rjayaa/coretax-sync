
// 'use client';

// import React, { useState, useCallback, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { FakturService } from '@/services/fakturService';
// import { toast } from '@/hooks/use-toast';
// import { generateExcelFile } from '@/lib/utils/excelGenerator';
// import { Plus, FileSpreadsheet } from 'lucide-react';
// import FakturTable from '@/components/FakturTable';
// import { Separator } from '@/components/ui/separator';

// export default function FakturListPage() {
//   const router = useRouter();
//   const [isExporting, setIsExporting] = useState(false);
//   // Use ref for faktur list to prevent re-renders
//   const fakturListRef = useRef<any[]>([]);

//   const handleCreateNew = useCallback(() => {
//     router.push('/user/faktur/create');
//   }, [router]);

//   const handleExport = useCallback(async () => {
//     const currentFakturList = fakturListRef.current;
    
//     if (currentFakturList.length === 0) {
//       toast({
//         title: "Perhatian",
//         description: "Tidak ada data faktur untuk di-export",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setIsExporting(true);
      
//       // Get all detail data for the current faktur list
//       const allDetailPromises = currentFakturList.map(faktur => 
//         FakturService.getFakturDetails(faktur.id)
//       );
      
//       const allDetails = await Promise.all(allDetailPromises);
//       const flattenedDetails = allDetails.flat();
      
//       // Generate Excel file
//       generateExcelFile(currentFakturList, flattenedDetails);
      
//       toast({
//         title: "Berhasil",
//         description: "File excel berhasil di-generate",
//       });
//     } catch (error) {
//       console.error('Error exporting Excel:', error);
//       toast({
//         title: "Error",
//         description: "Gagal mengexport file excel",
//         variant: "destructive",
//       });
//     } finally {
//       setIsExporting(false);
//     }
//   }, []); // No dependencies as we're using refs

//   const handleDataChange = useCallback((data: any[]) => {
//     // Update the ref without causing re-renders
//     fakturListRef.current = data;
//   }, []);

//   const handleEditFaktur = useCallback((id: string) => {
//     router.push(`/user/faktur/${id}/edit`);
//   }, [router]);

//   return (
//     <div className="space-y-4">
//       {/* Header dengan judul dan tombol aksi */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
//         <div>
//           <h1 className="text-2xl font-bold">Faktur Pajak</h1>
//           <p className="text-muted-foreground text-sm">Kelola daftar faktur pajak Anda</p>
//         </div>
        
//         <div className="flex flex-wrap gap-2">
//           <Button onClick={handleCreateNew} size="sm" variant="default">
//             <Plus className="h-4 w-4 mr-1" />
//             Buat Faktur
//           </Button>
//           {/* <Button 
//             onClick={handleExport} 
//             size="sm"
//             variant="outline"
//             disabled={isExporting}
//           >
//             {isExporting ? (
//               <>Loading...</>
//             ) : (
//               <>
//                 <FileSpreadsheet className="h-4 w-4 mr-1" />
//                 Export Excel
//               </>
//             )}
//           </Button> */}
//         </div>
//       </div>

//       <Separator className="my-2" />

//       {/* Tabel Faktur */}
//       <FakturTable 
//         onCreateNew={handleCreateNew} 
//         onDataChange={handleDataChange}
//         onEditFaktur={handleEditFaktur}
//       />
//     </div>
//   );
// }
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