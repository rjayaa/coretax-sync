// src/hooks/use-invoice-filters.ts
import { useState } from 'react';

export interface InvoiceFilters {
  startDate: string;
  endDate: string;
  status: string;
  customerId: string;
}

export const useInvoiceFilters = () => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    startDate: '',
    endDate: '',
    status: 'ALL',
    customerId: 'ALL',
  });

  const updateFilters = (newFilters: Partial<InvoiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'ALL',
      customerId: 'ALL',
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters,
  };
};