import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface FilterSummaryProps {
  dateRange: DateRange | undefined;
  filterYear: string | undefined;
  filterMonth: string | undefined;
  getMonthOptions: () => Array<{ value: string, label: string }>;
  clearDateFilters: () => void;
}

export const FilterSummary: React.FC<FilterSummaryProps> = ({ 
  dateRange,
  filterYear,
  filterMonth,
  getMonthOptions,
  clearDateFilters
}) => {
  return (
    <div className="bg-primary/5 rounded-md p-3 mb-4 flex items-center justify-between border border-primary/20">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-primary/10 p-1.5">
          <Filter className="h-4 w-4 text-primary" />
        </div>
        <div>
          <span className="text-sm font-medium">Filter Aktif: </span>
          <span className="text-sm">
            {dateRange?.from && dateRange?.to ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
                {format(dateRange.from, "dd-MM-yyyy", { locale: id })} s/d {format(dateRange.to, "dd-MM-yyyy", { locale: id })}
              </span>
            ) : filterYear && filterMonth ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
                {getMonthOptions().find(m => m.value === filterMonth)?.label} {filterYear}
              </span>
            ) : filterYear ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
                Tahun {filterYear}
              </span>
            ) : filterMonth ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
                {getMonthOptions().find(m => m.value === filterMonth)?.label} {new Date().getFullYear()}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={clearDateFilters}
        className="h-8 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        <span className="text-xs">Hapus Filter</span>
      </Button>
    </div>
  );
};