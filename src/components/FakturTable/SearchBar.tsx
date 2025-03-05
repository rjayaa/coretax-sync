import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch
}) => {
  return (
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
  );
};

export default SearchBar;