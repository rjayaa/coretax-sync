import { useState, useCallback } from 'react';
import { FakturData } from '@/types/faktur';
import { FakturService } from '@/services/fakturService';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { generateInternalRecapExcelFile } from '@/lib/utils/excelGeneratorInternal';
import { toast } from '@/hooks/use-toast';

interface UseExportStateProps {
  fakturs: (FakturData & { id: string })[];
  selectedFakturs: Set<string>;
}

export const useExportState = ({ 
  fakturs, 
  selectedFakturs 
}: UseExportStateProps) => {
  const [exporting, setExporting] = useState<{ type: string, status: boolean }>({ type: '', status: false });

  // Export selected fakturs
  const handleExportSelected = useCallback(async (format: 'faktur' | 'recap') => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk di-export',
        variant: 'default',
      });
      return;
    }

    setExporting({ type: format, status: true });
    try {
      console.log(`Exporting ${selectedFakturs.size} selected fakturs as ${format}`);
      
      // Get complete data for selected fakturs including details
      const selectedIds = Array.from(selectedFakturs);
      
      // Log what we're attempting to export
      console.log('Exporting faktur IDs:', selectedIds);
      
      // Get faktur data with details
      const fakturDataPromises = selectedIds.map(id => 
        FakturService.getFakturWithDetails(id)
          .catch(err => {
            console.error(`Error fetching faktur ${id}:`, err);
            return { faktur: null, details: [] };
          })
      );
      
      const fakturDataResults = await Promise.all(fakturDataPromises);
      
      // Filter out any null results (errors)
      const validResults = fakturDataResults.filter(result => result.faktur !== null);
      
      if (validResults.length === 0) {
        throw new Error('No valid faktur data found');
      }
      
      // Flatten the results
      const fakturList = validResults.map(result => result.faktur);
      const detailList = validResults.flatMap(result => result.details);
      
      console.log(`Found ${fakturList.length} fakturs with ${detailList.length} detail items`);

      // Generate Excel file based on selected format
      if (format === 'faktur') {
        generateExcelFile(fakturList, detailList);
        toast({
          title: 'Berhasil',
          description: `${validResults.length} faktur berhasil di-export ke Excel`,
        });
      } else {
        generateInternalRecapExcelFile(fakturList, detailList);
        toast({
          title: 'Berhasil',
          description: `Rekapan internal berhasil di-export ke Excel`,
        });
      }
    } catch (err) {
      console.error('Error exporting fakturs:', err);
      toast({
        title: 'Error',
        description: `Gagal mengexport ${format === 'faktur' ? 'faktur' : 'rekapan internal'} ke Excel`,
        variant: 'destructive',
      });
    } finally {
      setExporting({ type: '', status: false });
    }
  }, [selectedFakturs]);

  // Export all displayed fakturs
  const handleExportAll = useCallback(async (format: 'faktur' | 'recap') => {
    setExporting({ type: format, status: true });
    
    // Export all currently displayed data
    const fakturListToExport = [...fakturs];
    
    try {
      const detailPromises = fakturListToExport.map(faktur => 
        FakturService.getFakturDetails(faktur.id)
      );
      
      const allDetails = await Promise.all(detailPromises);
      const flattenedDetails = allDetails.flat();
      
      if (format === 'faktur') {
        generateExcelFile(fakturListToExport, flattenedDetails);
        toast({
          title: "Berhasil",
          description: "File excel berhasil di-generate",
        });
      } else {
        generateInternalRecapExcelFile(fakturListToExport, flattenedDetails);
        toast({
          title: "Berhasil",
          description: "Rekapan internal berhasil di-generate",
        });
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      toast({
        title: "Error",
        description: `Gagal mengexport ${format === 'faktur' ? 'file excel' : 'rekapan internal'}`,
        variant: "destructive",
      });
    } finally {
      setExporting({ type: '', status: false });
    }
  }, [fakturs]);

  return {
    exporting,
    handleExportSelected,
    handleExportAll
  };
};