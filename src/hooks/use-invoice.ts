// src/hooks/use-invoice.ts

import { useQuery } from '@tanstack/react-query';
import type { Invoice } from '@/types/tax-invoice';

interface UseInvoiceFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  customerId?: string;
}

export function useInvoices(filters: UseInvoiceFilters) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.customerId) params.append('customerId', filters.customerId);

      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.invoices;
    },
  });
}