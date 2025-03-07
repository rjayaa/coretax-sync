// 'use client';

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogDescription, 
//   DialogFooter, 
//   DialogHeader, 
//   DialogTitle 
// } from '@/components/ui/dialog';
// import { FakturData } from '@/types/faktur';
// import { UploadIcon, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Progress } from '@/components/ui/progress';

// interface ImportExcelButtonProps {
//   fakturId: string;
//   onDataImported: (data: Partial<FakturData>) => void;
// }

// export const ImportExcelButton: React.FC<ImportExcelButtonProps> = ({ 
//   fakturId,
//   onDataImported
// }) => {
//   const [open, setOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [importedData, setImportedData] = useState<Partial<FakturData> | null>(null);
//   const [progress, setProgress] = useState(0);
  
//   // Fungsi untuk membersihkan state
//   const resetState = () => {
//     setFileName(null);
//     setError(null);
//     setImportedData(null);
//     setProgress(0);
//   };
  
//   // Handle saat dialog ditutup
//   const handleOpenChange = (newOpen: boolean) => {
//     setOpen(newOpen);
//     if (!newOpen) {
//       resetState();
//     }
//   };
  
//   // Fungsi untuk handle file upload
//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
    
//     if (!file) return;

//     // Validasi tipe file
//     const fileExtension = file.name.split('.').pop()?.toLowerCase();
//     if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
//       setError('File harus berformat Excel (.xlsx atau .xls)');
//       return;
//     }

//     setIsLoading(true);
//     setFileName(file.name);
//     setError(null);
//     setProgress(10);
    
//     try {
//       // Baca file
//       const arrayBuffer = await file.arrayBuffer();
//       setProgress(30);
      
//       // Import library secara dinamis
//       const XLSX = await import('xlsx');
//       setProgress(50);
      
//       // Parse Excel file
//       const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
//         cellStyles: true,
//         cellFormulas: true,
//         cellDates: true,
//         cellNF: true,
//         sheetStubs: true
//       });
//       setProgress(70);
      
//       // Ambil sheet pertama
//       const firstSheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[firstSheetName];
      
//       // Konversi ke JSON
//       const rawData = XLSX.utils.sheet_to_json(worksheet, {
//         defval: null,
//         raw: false
//       });
      
//       setProgress(90);
      
//       if (rawData.length > 0) {
//         // Ambil data pertama dari Excel
//         const firstRow = rawData[0] as Record<string, any>;
        
//         // Map ke struktur FakturData
//         // Kita perlu menyelaraskan nama kolom dari Excel dengan nama field di FakturData
//         const mappedData: Partial<FakturData> = {
//           nomor_faktur_pajak: firstRow['Nomor Faktur Pajak'] || firstRow['nomor_faktur_pajak'] || '',
//           tanggal_faktur: formatDateFromExcel(firstRow['Tanggal Faktur Pajak'] || firstRow['tanggal_faktur']),
//           // Ambil bulan dari Masa Pajak
//           // Masa Pajak biasanya dalam format "01" atau "January" atau "Januari"
//           referensi: firstRow['Referensi'] || firstRow['referensi'] || '',
//           status_faktur: firstRow['Status Faktur'] || firstRow['status_faktur'] || '',
//           // Tambahan field lain jika diperlukan
//         };
        
//         setImportedData(mappedData);
//       } else {
//         setError('Tidak ada data yang ditemukan dalam file Excel');
//       }
      
//       setProgress(100);
//     } catch (err) {
//       console.error('Error saat membaca file:', err);
//       setError('Gagal membaca file. Pastikan file Excel valid.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Format tanggal dari Excel ke ISO string
//   const formatDateFromExcel = (excelDate: any): string => {
//     if (!excelDate) return '';
    
//     try {
//       // Jika excelDate sudah dalam format Date
//       if (excelDate instanceof Date) {
//         return excelDate.toISOString().split('T')[0];
//       }
      
//       // Jika excelDate dalam format string, coba parse
//       if (typeof excelDate === 'string') {
//         const dateParts = excelDate.split(/[\/\-\.]/);
        
//         // Cek format DD/MM/YYYY atau YYYY-MM-DD
//         if (dateParts.length === 3) {
//           const newDate = new Date();
          
//           // Jika format adalah DD/MM/YYYY
//           if (dateParts[0].length <= 2 && dateParts[1].length <= 2) {
//             newDate.setFullYear(
//               parseInt(dateParts[2]), 
//               parseInt(dateParts[1]) - 1, 
//               parseInt(dateParts[0])
//             );
//           } 
//           // Jika format adalah YYYY-MM-DD
//           else if (dateParts[0].length === 4) {
//             newDate.setFullYear(
//               parseInt(dateParts[0]), 
//               parseInt(dateParts[1]) - 1, 
//               parseInt(dateParts[2])
//             );
//           }
          
//           return newDate.toISOString().split('T')[0];
//         }
//       }
      
//       // Jika excelDate adalah nomor (serial number Excel)
//       if (typeof excelDate === 'number') {
//         // Excel menggunakan serial number, dengan 1 = 1 Jan 1900
//         // dan 60 tidak ada (bug Excel), jadi perlu dikoreksi
//         const date = new Date((excelDate - (excelDate > 60 ? 1 : 0) - 25569) * 86400 * 1000);
//         return date.toISOString().split('T')[0];
//       }
      
//     } catch (e) {
//       console.error('Error saat format tanggal:', e);
//     }
    
//     return '';
//   };
  
//   // Fungsi untuk apply imported data
//   const handleApplyData = () => {
//     if (importedData) {
//       onDataImported(importedData);
//       setOpen(false);
//       resetState();
//     }
//   };

//   return (
//     <>
//       <Button
//         variant="outline"
//         onClick={() => setOpen(true)}
//         className="gap-2"
//       >
//         <UploadIcon className="h-4 w-4" />
//         <span>Import dari Excel</span>
//       </Button>
      
//       <Dialog open={open} onOpenChange={handleOpenChange}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Import Data dari Excel</DialogTitle>
//             <DialogDescription>
//               Upload file Excel untuk mengisi data faktur secara otomatis.
//               Hanya baris pertama yang akan diambil.
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4 py-4">
//             {!fileName && !isLoading && (
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//                 <label className="block cursor-pointer">
//                   <input 
//                     type="file" 
//                     className="hidden" 
//                     accept=".xlsx,.xls" 
//                     onChange={handleFileUpload} 
//                     disabled={isLoading}
//                   />
//                   <div className="flex flex-col items-center justify-center">
//                     <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
//                     <p className="text-gray-700 mb-1">Klik untuk upload file Excel</p>
//                     <p className="text-sm text-gray-500">Format: .xlsx, .xls</p>
//                   </div>
//                 </label>
//               </div>
//             )}
            
//             {isLoading && (
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
//                   <div>
//                     <p className="font-medium">Memproses {fileName}</p>
//                     <p className="text-sm text-muted-foreground">Mengekstrak data...</p>
//                   </div>
//                 </div>
//                 <Progress value={progress} className="h-2" />
//               </div>
//             )}
            
//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
            
//             {fileName && !isLoading && !error && importedData && (
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <FileIcon className="h-8 w-8 text-green-500" />
//                   <div>
//                     <p className="font-medium">{fileName}</p>
//                     <p className="text-sm text-green-600">File berhasil diproses</p>
//                   </div>
//                 </div>
                
//                 <div className="border rounded-md p-4 bg-muted/30 space-y-2">
//                   <h3 className="text-sm font-medium">Preview Data yang Akan Diimport:</h3>
                  
//                   {importedData.nomor_faktur_pajak && (
//                     <div className="grid grid-cols-2 gap-2">
//                       <p className="text-sm text-muted-foreground">Nomor Faktur Pajak:</p>
//                       <p className="text-sm font-medium">{importedData.nomor_faktur_pajak}</p>
//                     </div>
//                   )}
                  
//                   {importedData.tanggal_faktur && (
//                     <div className="grid grid-cols-2 gap-2">
//                       <p className="text-sm text-muted-foreground">Tanggal Faktur:</p>
//                       <p className="text-sm font-medium">{importedData.tanggal_faktur}</p>
//                     </div>
//                   )}
                  
//                   {importedData.status_faktur && (
//                     <div className="grid grid-cols-2 gap-2">
//                       <p className="text-sm text-muted-foreground">Status Faktur:</p>
//                       <p className="text-sm font-medium">{importedData.status_faktur}</p>
//                     </div>
//                   )}
                  
//                   {importedData.referensi && (
//                     <div className="grid grid-cols-2 gap-2">
//                       <p className="text-sm text-muted-foreground">Referensi:</p>
//                       <p className="text-sm font-medium">{importedData.referensi}</p>
//                     </div>
//                   )}
//                 </div>
                
//                 <Alert>
//                   <CheckCircle className="h-4 w-4" />
//                   <AlertDescription>
//                     Data dari Excel siap untuk diimport. Klik "Import Data" untuk mengisi form faktur.
//                   </AlertDescription>
//                 </Alert>
//               </div>
//             )}
//           </div>
          
//           <DialogFooter className="flex space-x-2 justify-end">
//             <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
//             {fileName && !isLoading && !error && importedData && (
//               <Button onClick={handleApplyData}>Import Data</Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default ImportExcelButton;


'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { UploadIcon, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface ImportExcelButtonProps {
  fakturId: string;
  onDataImported: (data: Partial<FakturData>, detailData?: Partial<DetailFakturData>[]) => void;
}

export const ImportExcelButton: React.FC<ImportExcelButtonProps> = ({ 
  fakturId,
  onDataImported
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<{
    faktur: Partial<FakturData>,
    details?: Partial<DetailFakturData>[]
  } | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Fungsi untuk membersihkan state
  const resetState = () => {
    setFileName(null);
    setError(null);
    setImportedData(null);
    setProgress(0);
  };
  
  // Handle saat dialog ditutup
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };
  
  // Fungsi untuk handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validasi tipe file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('File harus berformat Excel (.xlsx atau .xls)');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);
    setError(null);
    setProgress(10);
    
    try {
      // Baca file
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);
      
      // Import library secara dinamis
      const XLSX = await import('xlsx');
      setProgress(50);
      
      // Parse Excel file
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });
      setProgress(70);
      
      // Ambil sheet pertama
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Konversi ke JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        defval: null,
        raw: false
      });
      
      setProgress(90);
      
      if (rawData.length > 0) {
        // Ambil data pertama dari Excel
        const firstRow = rawData[0] as Record<string, any>;
        
        // Kolom yang akan diexclude
        const excludedColumns = [
          'penandatangan', 
          'Penandatangan',
          'Dilaporkan oleh Penjual', 
          'dilaporkan_oleh_penjual',
          'Dilaporkan oleh Pemungut PPN', 
          'dilaporkan_oleh_pemungut_ppn'
        ];
        
        // 1. Data Faktur (fokus pada nomor_faktur_pajak dan status_faktur)
        const mappedFakturData: Partial<FakturData> = {};
        
        // 1.1 Nomor Faktur Pajak (prioritas tertinggi - biasanya kosong di sistem awal)
        if (firstRow['Nomor Faktur Pajak'] || firstRow['nomor_faktur_pajak']) {
          mappedFakturData.nomor_faktur_pajak = firstRow['Nomor Faktur Pajak'] || firstRow['nomor_faktur_pajak'];
        }
        
        // 1.2 Status Faktur (prioritas tinggi - biasanya DRAFT di sistem awal)
        if (firstRow['Status Faktur'] || firstRow['status_faktur']) {
          mappedFakturData.status_faktur = firstRow['Status Faktur'] || firstRow['status_faktur'];
        }
        
        // 1.3 Referensi
        if (firstRow['Referensi'] || firstRow['referensi']) {
          mappedFakturData.referensi = firstRow['Referensi'] || firstRow['referensi'];
        }
        
        // 1.4 Tanggal Faktur
        if (firstRow['Tanggal Faktur'] || firstRow['tanggal_faktur'] || firstRow['Tanggal Faktur Pajak']) {
          mappedFakturData.tanggal_faktur = formatDateFromExcel(
            firstRow['Tanggal Faktur'] || firstRow['tanggal_faktur'] || firstRow['Tanggal Faktur Pajak']
          );
        }
        
        // 2. Data Detail Faktur (fokus pada nilai-nilai DPP, PPN, dll)
        const mappedDetailData: Partial<DetailFakturData>[] = [];
        const detailData: Partial<DetailFakturData> = {
          id_faktur: fakturId
        };
        
        // 2.1 DPP (dari Harga Jual/Penggantian/DPP)
        if (firstRow['Harga Jual/Penggantian/DPP'] || firstRow['DPP'] || firstRow['dpp']) {
          detailData.dpp = String(firstRow['Harga Jual/Penggantian/DPP'] || firstRow['DPP'] || firstRow['dpp']);
        }
        
        // 2.2 DPP Nilai Lain
        if (firstRow['DPP Nilai Lain/DPP'] || firstRow['DPP Nilai Lain'] || firstRow['dpp_nilai_lain']) {
          detailData.dpp_nilai_lain = String(firstRow['DPP Nilai Lain/DPP'] || firstRow['DPP Nilai Lain'] || firstRow['dpp_nilai_lain']);
        }
        
        // 2.3 PPN
        if (firstRow['PPN'] || firstRow['ppn']) {
          detailData.ppn = String(firstRow['PPN'] || firstRow['ppn']);
        }
        
        // 2.4 PPnBM
        if (firstRow['PPnBM'] || firstRow['ppnbm']) {
          detailData.ppnbm = String(firstRow['PPnBM'] || firstRow['ppnbm']);
        }
        
        // 2.5 Harga Satuan (sama dengan DPP untuk konteks ini)
        if (firstRow['Harga Jual/Penggantian/DPP'] || firstRow['DPP'] || firstRow['dpp']) {
          detailData.harga_satuan = String(firstRow['Harga Jual/Penggantian/DPP'] || firstRow['DPP'] || firstRow['dpp']);
        }
        
        // Tambahkan ke array detail jika memiliki data
        if (Object.keys(detailData).length > 1) { // > 1 karena pasti ada id_faktur
          mappedDetailData.push(detailData);
        }
        
        // Tambahkan field lain yang belum dimapping tapi ada di Excel
        Object.keys(firstRow).forEach(key => {
          // Skip jika key adalah kolom yang diexclude
          if (excludedColumns.includes(key) || firstRow[key] === null || firstRow[key] === undefined) {
            return;
          }
          
          // Normalize key dari Excel untuk match dengan data keys
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
          
          // Skip jika kita sudah memiliki nilai untuk key ini
          if (Object.keys(mappedFakturData).some(k => k.toLowerCase() === normalizedKey)) {
            return;
          }
          
          // Cek apakah ada field di FakturData yang sesuai dengan key dari Excel
          const fakturDataKeys = Object.keys({} as FakturData);
          const matchingFakturKey = fakturDataKeys.find(k => k.toLowerCase() === normalizedKey);
          
          // Atau cek apakah field ada di DetailFakturData
          const detailFakturDataKeys = Object.keys({} as DetailFakturData);
          const matchingDetailKey = detailFakturDataKeys.find(k => k.toLowerCase() === normalizedKey);
          
          if (matchingFakturKey) {
            // @ts-ignore - Dinamis key assignment
            mappedFakturData[matchingFakturKey] = firstRow[key];
          } 
          else if (matchingDetailKey && mappedDetailData.length > 0) {
            // @ts-ignore - Dinamis key assignment untuk detail
            mappedDetailData[0][matchingDetailKey] = firstRow[key];
          }
        });
        
        setImportedData({
          faktur: mappedFakturData,
          details: mappedDetailData.length > 0 ? mappedDetailData : undefined
        });
        
        if (Object.keys(mappedFakturData).length === 0 && mappedDetailData.length === 0) {
          setError('Tidak ada data yang relevan ditemukan dalam file Excel');
        }
      } else {
        setError('Tidak ada data yang ditemukan dalam file Excel');
      }
      
      setProgress(100);
    } catch (err) {
      console.error('Error saat membaca file:', err);
      setError('Gagal membaca file. Pastikan file Excel valid.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format tanggal dari Excel ke ISO string
  const formatDateFromExcel = (excelDate: any): string => {
    if (!excelDate) return '';
    
    try {
      // Jika excelDate sudah dalam format Date
      if (excelDate instanceof Date) {
        return excelDate.toISOString().split('T')[0];
      }
      
      // Jika excelDate dalam format string, coba parse
      if (typeof excelDate === 'string') {
        const dateParts = excelDate.split(/[\/\-\.]/);
        
        // Cek format DD/MM/YYYY atau YYYY-MM-DD
        if (dateParts.length === 3) {
          const newDate = new Date();
          
          // Jika format adalah DD/MM/YYYY
          if (dateParts[0].length <= 2 && dateParts[1].length <= 2) {
            newDate.setFullYear(
              parseInt(dateParts[2]), 
              parseInt(dateParts[1]) - 1, 
              parseInt(dateParts[0])
            );
          } 
          // Jika format adalah YYYY-MM-DD
          else if (dateParts[0].length === 4) {
            newDate.setFullYear(
              parseInt(dateParts[0]), 
              parseInt(dateParts[1]) - 1, 
              parseInt(dateParts[2])
            );
          }
          
          return newDate.toISOString().split('T')[0];
        }
      }
      
      // Jika excelDate adalah nomor (serial number Excel)
      if (typeof excelDate === 'number') {
        // Excel menggunakan serial number, dengan 1 = 1 Jan 1900
        // dan 60 tidak ada (bug Excel), jadi perlu dikoreksi
        const date = new Date((excelDate - (excelDate > 60 ? 1 : 0) - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
      
    } catch (e) {
      console.error('Error saat format tanggal:', e);
    }
    
    return '';
  };
  
  // Fungsi untuk apply imported data
  const handleApplyData = () => {
    if (importedData) {
      onDataImported(importedData.faktur, importedData.details);
      setOpen(false);
      resetState();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <UploadIcon className="h-4 w-4" />
        <span>Import dari Excel</span>
      </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data dari Excel</DialogTitle>
            <DialogDescription>
              Upload file Excel untuk mengisi data faktur secara otomatis.
              Hanya baris pertama yang akan diambil. Data yang tidak ada di Excel tidak akan diubah.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!fileName && !isLoading && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <label className="block cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileUpload} 
                    disabled={isLoading}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-gray-700 mb-1">Klik untuk upload file Excel</p>
                    <p className="text-sm text-gray-500">Format: .xlsx, .xls</p>
                  </div>
                </label>
              </div>
            )}
            
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <div>
                    <p className="font-medium">Memproses {fileName}</p>
                    <p className="text-sm text-muted-foreground">Mengekstrak data...</p>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {fileName && !isLoading && !error && importedData && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <p className="text-sm text-green-600">File berhasil diproses</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-muted/30 space-y-3 max-h-64 overflow-y-auto">
                  <h3 className="text-sm font-medium">Preview Data Faktur:</h3>
                  
                  {Object.keys(importedData.faktur).length > 0 ? (
                    Object.entries(importedData.faktur).map(([key, value]) => 
                      value && (
                        <div className="grid grid-cols-2 gap-2" key={key}>
                          <p className="text-sm text-muted-foreground">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada data faktur yang ditemukan</p>
                  )}
                  
                  {importedData.details && importedData.details.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium pt-2 border-t mt-2">Preview Data Detail:</h3>
                      {importedData.details.map((detail, index) => (
                        <div key={index} className="pl-2 border-l-2 border-primary/30 mt-1">
                          <p className="text-sm font-medium mb-1">Item {index + 1}</p>
                          {Object.entries(detail)
                            .filter(([key]) => key !== 'id_faktur')
                            .map(([key, value]) => 
                              value && (
                                <div className="grid grid-cols-2 gap-2" key={key}>
                                  <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</p>
                                  <p className="text-xs">{value}</p>
                                </div>
                              )
                            )
                          }
                        </div>
                      ))}
                    </>
                  )}
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data dari Excel siap untuk diimport. Data yang sudah ada dan tidak ada di Excel akan tetap dipertahankan.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            {fileName && !isLoading && !error && importedData && (
              <Button onClick={handleApplyData}>Import Data</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportExcelButton;