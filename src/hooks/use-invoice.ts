// src/hooks/use-invoice.ts
import { useQuery } from '@tanstack/react-query';
import type { InvoiceFilters } from './use-invoice-filters';

interface Invoice {
  id: string;
  date: string;
  number: string;
  customer: string;
  npwp: string;
  type: string;
  dpp: number;
  ppn: number;
  status: string;
}

interface InvoiceResponse {
  success: boolean;
  invoices: Invoice[];
}

export function useInvoices(filters: InvoiceFilters) {
  return useQuery<InvoiceResponse, Error>({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.customerId !== 'ALL') params.append('customerId', filters.customerId);
      
      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch invoices');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Data dianggap fresh selama 5 menit
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery<any>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice detail');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export type { Invoice, InvoiceResponse };