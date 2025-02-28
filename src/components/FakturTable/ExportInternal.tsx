'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';
import { generateInternalRecapExcelFile } from '@/lib/utils/excelGeneratorInternal';
import { Loader2, Download, FileSpreadsheet } from 'lucide-react';

// Komponen tombol export yang dapat digunakan di berbagai halaman
export const ExportInternalRecapButton = ({ 
  selectedIds, 
  getAllData = false,
  variant = "outline",
  size = "sm" 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = useCallback(async () => {
    if (!selectedIds.size && !getAllData) {
      toast({
        title: "Perhatian",
        description: "Pilih minimal satu faktur untuk di-export",
        variant: "default",
      });
      return;
    }

    setIsExporting(true);
    try {
      let fakturList = [];
      let detailList = [];

      // Jika perlu export semua data (tidak hanya yang dipilih)
      if (getAllData) {
        // Mendapatkan semua data faktur
        const response = await FakturService.getFakturs({ limit: 999 });
        fakturList = response.fakturs;
        
        // Dapatkan detail untuk setiap faktur
        const detailPromises = fakturList.map(faktur => 
          FakturService.getFakturDetails(faktur.id)
        );
        
        const allDetails = await Promise.all(detailPromises);
        detailList = allDetails.flat();
      } else {
        // Export hanya yang dipilih
        const selectedIdsArray = Array.from(selectedIds);
        
        // Dapatkan data faktur dan detail untuk faktur yang dipilih
        const fakturPromises = selectedIdsArray.map(id => 
          FakturService.getFakturWithDetails(id)
            .catch(err => {
              console.error(`Error fetching faktur ${id}:`, err);
              return { faktur: null, details: [] };
            })
        );
        
        const results = await Promise.all(fakturPromises);
        
        // Filter hasil yang valid
        const validResults = results.filter(result => result.faktur !== null);
        
        if (validResults.length === 0) {
          throw new Error('Tidak ada data faktur yang valid');
        }
        
        fakturList = validResults.map(result => result.faktur);
        detailList = validResults.flatMap(result => result.details);
      }
      
      console.log(`Exporting ${fakturList.length} fakturs with ${detailList.length} detail items`);
      
      // Generate file Excel
      generateInternalRecapExcelFile(fakturList, detailList);
      
      toast({
        title: "Berhasil",
        description: `Rekapan Internal berhasil di-export ke Excel`,
      });
    } catch (err) {
      console.error('Error exporting internal recap:', err);
      toast({
        title: "Error",
        description: "Gagal mengexport rekapan internal ke Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedIds, getAllData]);
  
  return (
    <Button 
      onClick={handleExport} 
      size={size}
      variant={variant}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Export Rekapan Internal
        </>
      )}
    </Button>
  );
};

// Contoh penggunaan di halaman
export default function InternalRecapPage() {
  const [selectedFakturs, setSelectedFakturs] = useState(new Set());
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rekapan Internal</h1>
        
        <div className="flex gap-2">
          {/* Export yang dipilih */}
          <ExportInternalRecapButton 
            selectedIds={selectedFakturs} 
            getAllData={false}
          />
          
          {/* Export semua data */}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              // Tampilkan konfirmasi terlebih dahulu
              if (confirm('Apakah Anda yakin ingin mengexport semua data?')) {
                // Gunakan komponen dengan flag getAllData=true
                const exportBtn = document.createElement('button');
                exportBtn.setAttribute('data-export-all', 'true');
                document.body.appendChild(exportBtn);
                exportBtn.click();
                document.body.removeChild(exportBtn);
              }
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Semua Data
          </Button>
        </div>
      </div>
      
      {/* Tampilkan tabel faktur dengan komponen yang sama dengan FakturTable */}
      {/* ... */}
    </div>
  );
}