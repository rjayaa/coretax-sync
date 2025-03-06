
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileSpreadsheet,
  ChevronDown,
  Filter
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isFilterApplied: boolean;
  toggleFilterExpanded: () => void;
  limit: number;
  setLimit: (limit: number) => void;
  handleExportAll?: (format: 'faktur' | 'recap') => Promise<void>;
  loading: boolean;
  exporting: { type: string, status: boolean };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  isFilterApplied,
  toggleFilterExpanded,
  limit,
  setLimit,
  handleExportAll,
  loading,
  exporting
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Cari faktur..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" size="sm" className="shrink-0 h-9">
          Cari
        </Button>
      </form>
      
      <div className="flex items-center gap-2">
        {/* Date Filter Toggle Button */}
        <Button
          variant={isFilterApplied ? "default" : "outline"} 
          size="sm"
          onClick={toggleFilterExpanded}
          className="h-9 gap-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
          {isFilterApplied && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-medium text-primary">
              ✓
            </span>
          )}
        </Button>
        
        <Select
          value={limit.toString()}
          onValueChange={(value) => setLimit(parseInt(value))}
        >
          <SelectTrigger className="w-[80px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Export Dropdown (only displayed in export tab) */}
        {handleExportAll && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2"
                disabled={exporting.status}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                <span>Export</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Excel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleExportAll('faktur')}
                disabled={exporting.status}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span>Format Faktur</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExportAll('recap')}
                disabled={exporting.status}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span>Rekapan Internal</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};