
import { useState, useEffect, useCallback, useRef } from 'react';
import { FakturService } from '@/services/fakturService';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { toast } from '@/hooks/use-toast';

// Extended interface to include faktur details
interface FakturWithDetails extends FakturData {
  id: string;
  details?: DetailFakturData[];
}

interface UseTableStateProps {
  filterParams: any;
  isFilterApplied: boolean;
  onDataChange?: (data: FakturWithDetails[]) => void;
}

export const useTableState = ({ 
  filterParams, 
  isFilterApplied, 
  onDataChange 
}: UseTableStateProps) => {
  const [fakturs, setFakturs] = useState<FakturWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  
  // Use refs to keep track of current values without causing re-renders
  const onDataChangeRef = useRef(onDataChange);
  const filterParamsRef = useRef(filterParams);
  const pageRef = useRef(page);
  const limitRef = useRef(limit);
  const searchTermRef = useRef(searchTerm);
  const isFilterAppliedRef = useRef(isFilterApplied);
  
  // Update refs when values change
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);
  
  useEffect(() => {
    filterParamsRef.current = filterParams;
  }, [filterParams]);
  
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  
  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);
  
  useEffect(() => {
    isFilterAppliedRef.current = isFilterApplied;
  }, [isFilterApplied]);

  // Main data fetching function that uses ref values and fetches details
  const fetchFakturs = useCallback(async () => {
    console.log('Fetching fakturs with page:', pageRef.current, 'limit:', limitRef.current, 'search:', searchTermRef.current);
    
    try {
      // Prepare filter params using refs
      const params: any = {
        page: pageRef.current,
        limit: limitRef.current,
        search: searchTermRef.current,
        ...filterParamsRef.current
      };
      
      console.log('Filter params:', params);
      const response = await FakturService.getFakturs(params);
      
      console.log('Fetched fakturs:', response.fakturs.length);
      
      // Fetch details for each faktur
      const faktursWithDetails: FakturWithDetails[] = [];
      
      for (const faktur of response.fakturs) {
        try {
          const details = await FakturService.getFakturDetails(faktur.id);
          faktursWithDetails.push({
            ...faktur,
            details
          });
        } catch (detailError) {
          console.error(`Error fetching details for faktur ${faktur.id}:`, detailError);
          faktursWithDetails.push({
            ...faktur,
            details: []
          });
        }
      }
      
      setFakturs(faktursWithDetails);
      setTotalPages(response.pagination.totalPages);
      
      // Call onDataChange callback if provided using the ref
      if (onDataChangeRef.current) {
        onDataChangeRef.current(faktursWithDetails);
      }
      
      return { ...response, fakturs: faktursWithDetails };
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
  }, []); // No dependencies here, we use refs instead

  // Delete a single faktur
  const deleteFaktur = useCallback(async (id: string): Promise<boolean> => {
    try {
      await FakturService.deleteFaktur(id);
      
      toast({
        title: 'Berhasil',
        description: 'Faktur berhasil dihapus',
      });
      
      // Refresh the data
      fetchFakturs();
      return true;
    } catch (err) {
      console.error('Error deleting faktur:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus faktur',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchFakturs]);

  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Fetch data when certain values change, with a proper dependency array
  useEffect(() => {
    // Skip the first render to prevent double fetching on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      const initialLoad = async () => {
        setLoading(true);
        try {
          await fetchFakturs();
        } finally {
          setLoading(false);
        }
      };
      
      initialLoad();
      return;
    }
    
    // Set a small delay to prevent too many successive calls
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        await fetchFakturs();
      } finally {
        setLoading(false);
      }
    }, 100);
    
    // Cleanup the timeout if the component unmounts or the effect runs again
    return () => clearTimeout(handler);
  }, [page, limit, searchTerm, filterParams, isFilterApplied, fetchFakturs]);

  // Handle search form submission
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

  // Handle limit change
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    fakturs,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    limit,
    setLimit: handleLimitChange,
    fetchFakturs,
    handleSearch,
    handleRefresh,
    deleteFaktur
  };
};