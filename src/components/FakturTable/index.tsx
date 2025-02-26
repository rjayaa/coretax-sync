'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableContent } from './TableContent';
import { FakturData } from '@/types/faktur';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { Loader2, Download, Search, RefreshCcw,  } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';


interface FakturTableProps {
  onCreateNew?: () => void;
  onDataChange?: (data: (FakturData & { id: string })[]) => void;
  onEditFaktur?: (id: string) => void;
}

export const FakturTable: React.FC<FakturTableProps> = ({ 
  onCreateNew,
  onDataChange,
  onEditFaktur
}) => {
  const router = useRouter();
  const [fakturs, setFakturs] = useState<(FakturData & { id: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFakturs, setSelectedFakturs] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  
  // Use a ref for the callback to prevent it from causing re-renders
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Main data fetching function
  const fetchFakturs = useCallback(async () => {
    // Don't set loading here, as we already handle it in useEffect
    console.log('Fetching fakturs with page:', page, 'limit:', limit, 'search:', searchTerm);
    
    try {
      const response = await FakturService.getFakturs({
        page,
        limit,
        search: searchTerm
      });
      
      console.log('Fetched fakturs:', response.fakturs.length);
      setFakturs(response.fakturs);
      setTotalPages(response.pagination.totalPages);
      
      // Call onDataChange callback if provided using the ref
      if (onDataChangeRef.current) {
        onDataChangeRef.current(response.fakturs);
      }
      
      return response;
    } catch (err) {
      console.error('Error fetching fakturs:', err);
      setError('Failed to load faktur data');
      toast({
        title: 'Error',
        description: 'Gagal memuat data faktur',
        variant: 'destructive',
      });
      throw err;
    }
  }, [page, limit, searchTerm]);

  // Fetch data when params change (with loading state handling)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchFakturs();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [page, limit, searchTerm, fetchFakturs]);

  // Handle checkbox selection
  const handleSelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedFakturs(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) {
      const allIds = fakturs.map(faktur => faktur.id);
      setSelectedFakturs(new Set(allIds));
    } else {
      setSelectedFakturs(new Set());
    }
  }, [fakturs]);

  // Navigate to detail/edit page
  const handleEditFaktur = useCallback((id: string) => {
    router.push(`/user/faktur/${id}/edit`);
  }, [router]);

  // Export selected fakturs
  const handleExportSelected = useCallback(async () => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk di-export',
        variant: 'default',
      });
      return;
    }

    setExporting(true);
    try {
      console.log(`Exporting ${selectedFakturs.size} selected fakturs`);
      
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

      // Generate Excel file
      generateExcelFile(fakturList, detailList);

      toast({
        title: 'Berhasil',
        description: `${validResults.length} faktur berhasil di-export ke Excel`,
      });
    } catch (err) {
      console.error('Error exporting fakturs:', err);
      toast({
        title: 'Error',
        description: 'Gagal mengexport faktur ke Excel',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  }, [selectedFakturs]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    // fetchFakturs() will be called via useEffect
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchFakturs().finally(() => setLoading(false));
  }, [fetchFakturs]);

  // Delete selected fakturs
  const handleDeleteSelected = useCallback(async () => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk dihapus',
        variant: 'default',
      });
      return;
    }

    if (!confirm(`Anda yakin ingin menghapus ${selectedFakturs.size} faktur?`)) {
      return;
    }

    setLoading(true);
    try {
      const selectedIds = Array.from(selectedFakturs);
      const deletePromises = selectedIds.map(id => FakturService.deleteFaktur(id));
      await Promise.all(deletePromises);

      toast({
        title: 'Berhasil',
        description: `${selectedFakturs.size} faktur berhasil dihapus`,
      });
      
      // Reset selection and refresh data
      setSelectedFakturs(new Set());
      fetchFakturs();
    } catch (err) {
      console.error('Error deleting fakturs:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus faktur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedFakturs, fetchFakturs]);

  console.log('Rendering FakturTable component', { 
    loading, 
    faktursLength: fakturs.length,
    totalPages
  });

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4">
        {/* Search and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                type="search"
                placeholder="Cari faktur..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="shrink-0 h-9">
              Cari
            </Button>
          </form>
          
          <div className="flex items-center gap-2">
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1); // Reset to first page when changing limit
              }}
            >
              <SelectTrigger className="w-[80px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-9 w-9 p-0"
              title="Refresh"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Selected items actions */}
        {selectedFakturs.size > 0 && (
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md mb-4">
            <div className="text-sm">
              <span className="font-medium">{selectedFakturs.size}</span> faktur dipilih
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedFakturs(new Set())}
                className="h-8"
              >
                Batal
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportSelected}
                disabled={exporting}
                className="h-8"
              >
                {exporting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Download className="h-3 w-3 mr-1" />
                )}
                Export Excel
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDeleteSelected}
                disabled={loading}
                className="h-8"
              >
                Hapus
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <TableContent
          fakturs={fakturs}
          loading={loading}
          error={error}
          selectedIds={selectedFakturs}
          onSelect={handleSelection}
          onSelectAll={handleSelectAll}
          onEdit={onEditFaktur || handleEditFaktur}
        />

        {/* Pagination */}
        {!loading && !error && fakturs.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="text-muted-foreground">
              Menampilkan {fakturs.length} dari {(page - 1) * limit + 1} - {Math.min(page * limit, totalPages * limit)} faktur
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="h-8 px-3"
              >
                Prev
              </Button>
              
              <div className="flex items-center px-2">
                <span className="text-sm">{page} / {totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || loading}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FakturTable;