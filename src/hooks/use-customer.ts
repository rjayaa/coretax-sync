// src/hooks/use-customer.ts
import { useQuery } from '@tanstack/react-query';

interface Customer {
  id: string;
  nama: string;
  npwp: string;
  jalan: string | null;
  alamatLengkap: string;
}

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      return data.customers;
    }
  });
}