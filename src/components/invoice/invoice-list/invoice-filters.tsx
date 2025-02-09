// src/components/invoice/invoice-filters.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InvoiceFilters } from "@/hooks/use-invoice-filters";
import type { Customer } from "@/hooks/use-customer";

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: Partial<InvoiceFilters>) => void;
  customers: Customer[];
  isLoadingCustomers: boolean;
  onClearFilters: () => void;
}

export const InvoiceFilters = ({
  filters,
  onFilterChange,
  customers,
  isLoadingCustomers,
  onClearFilters,
}: InvoiceFiltersProps) => {
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
};