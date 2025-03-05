import { useState, useEffect, useCallback, useRef } from 'react';
import { FakturData } from '@/types/faktur';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';

interface UseSelectionStateProps {
  fakturs: (FakturData & { id: string })[];
  onSelectionChange?: (selectedIds: Set<string>) => void;
  fetchFakturs: () => Promise<any>;
}

export const useSelectionState = ({ 
  fakturs, 
  onSelectionChange,
  fetchFakturs
}: UseSelectionStateProps) => {
  const [selectedFakturs, setSelectedFakturs] = useState<Set<string>>(new Set());
  
  // Use a ref for the callback to prevent it from causing re-renders
  const onSelectionChangeRef = useRef(onSelectionChange);
  
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);
  
  // Effect to forward selection changes to parent component
  useEffect(() => {
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(selectedFakturs);
    }
  }, [selectedFakturs]);

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

  // Delete selected fakturs
  const handleDeleteSelected = useCallback(async () => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk dihapus',
        variant: 'default',
      });
      return false;
    }

    if (!confirm(`Anda yakin ingin menghapus ${selectedFakturs.size} faktur?`)) {
      return false;
    }

    try {
      const selectedIds = Array.from(selectedFakturs);
      const deletePromises = selectedIds.map(id => FakturService.deleteFaktur(id));
      await Promise.all(deletePromises);

      toast({
        title: 'Berhasil',
        description: `${selectedFakturs.size} faktur berhasil dihapus`,
      });
      
      // Reset selection
      setSelectedFakturs(new Set());
      
      // Refresh data
      fetchFakturs();
      
      return true;
    } catch (err) {
      console.error('Error deleting fakturs:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus faktur',
        variant: 'destructive',
      });
      return false;
    }
  }, [selectedFakturs, fetchFakturs]);

  return {
    selectedFakturs,
    setSelectedFakturs,
    handleSelection,
    handleSelectAll,
    handleDeleteSelected
  };
};