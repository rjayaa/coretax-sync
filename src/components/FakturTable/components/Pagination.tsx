import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  totalItems: number;
  setPage: (page: number) => void;
  loading: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  limit,
  totalItems,
  setPage,
  loading
}) => {
  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <div className="text-muted-foreground">
        Menampilkan {totalItems} dari {(page - 1) * limit + 1} - {Math.min(page * limit, totalPages * limit)} faktur
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="h-8 px-3"
        >
          Prev
        </Button>
        
        <div className="flex items-center px-2">
          <span className="text-sm">{page} / {totalPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages || loading}
          className="h-8 px-3"
        >
          Next
        </Button>
      </div>
    </div>
  );
};