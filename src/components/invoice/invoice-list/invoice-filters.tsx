// src/components/invoice/invoice-filters.tsx
'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { taxMasterCustomer } from '@/lib/db/schema/master';

type Customer = typeof taxMasterCustomer.$inferSelect;

interface InvoiceFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    status: string;
    customerId: string;
  };
  onFilterChange: (filters: Partial<InvoiceFiltersProps['filters']>) => void;
  customers: Customer[];
  isLoadingCustomers: boolean;
  onClearFilters: () => void;
}

export function InvoiceFilters({
  filters,
  onFilterChange,
  customers = [], // Provide default empty array
  isLoadingCustomers,
  onClearFilters,
}: InvoiceFiltersProps) {
  if (!Array.isArray(customers)) {
    console.error('Customers is not an array:', customers);
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex gap-2">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
          className="w-40"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
          className="w-40"
        />
      </div>
      
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ status: value })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.customerId}
        onValueChange={(value) => onFilterChange({ customerId: value })}
        disabled={isLoadingCustomers}
      >
        <SelectTrigger className="w-60">
          <SelectValue placeholder="Pilih Customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Customer</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onClearFilters}>
        Reset Filter
      </Button>
    </div>
  );
}