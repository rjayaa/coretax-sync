import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import SimpleDateRangePicker from '@/components/ui/simple-date-picker';

interface FilterPanelProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  filterYear: string | undefined;
  setFilterYear: (year: string | undefined) => void;
  filterMonth: string | undefined;
  setFilterMonth: (month: string | undefined) => void;
  activeShortcut: string | null;
  activateShortcut: (shortcut: string) => void;
  toggleFilterExpanded: () => void;
  applyDateFilters: () => void;
  clearDateFilters: () => void;
  getYearOptions: () => string[];
  getMonthOptions: () => Array<{ value: string, label: string }>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  dateRange,
  setDateRange,
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  activeShortcut,
  activateShortcut,
  toggleFilterExpanded,
  applyDateFilters,
  clearDateFilters,
  getYearOptions,
  getMonthOptions
}) => {
  return (
    <div className="bg-card border rounded-md p-4 mb-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Filter Tanggal Faktur</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFilterExpanded}
          className="h-7 w-7 p-0 rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Tutup</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Rentang Tanggal */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <label className="text-sm font-medium">Rentang Tanggal</label>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={activeShortcut === 'month' ? "default" : "outline"}
              size="sm"
              onClick={() => activateShortcut('month')}
              className="h-8 text-xs px-2"
            >
              Bulan Ini
            </Button>
            
            <Button
              variant={activeShortcut === 'week' ? "default" : "outline"}
              size="sm"
              onClick={() => activateShortcut('week')}
              className="h-8 text-xs px-2"
            >
              7 Hari Terakhir
            </Button>
          </div>
          
          <SimpleDateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            startPlaceholder="Tanggal Awal"
            endPlaceholder="Tanggal Akhir"
          />
        </div>
        
        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">
              atau
            </span>
          </div>
        </div>
        
        {/* Year/Month Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <label className="text-sm font-medium">Filter Tahun/Bulan</label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={filterYear}
              onValueChange={(value) => setFilterYear(value === "undefined" ? undefined : value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Semua Tahun</SelectItem>
                {getYearOptions().map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filterMonth}
              onValueChange={(value) => setFilterMonth(value === "undefined" ? undefined : value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Semua Bulan</SelectItem>
                {getMonthOptions().map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-3 border-t border-border mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearDateFilters}
          className="h-9"
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={applyDateFilters}
          className="h-9"
          disabled={
            (dateRange?.from && !dateRange?.to) || 
            (!dateRange?.from && dateRange?.to) || 
            (!dateRange?.from && !dateRange?.to && !filterYear && !filterMonth)
          }
        >
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
};