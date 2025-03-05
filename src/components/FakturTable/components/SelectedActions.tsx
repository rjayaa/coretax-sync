import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileSpreadsheet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface SelectedActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExportSelected: (format: 'faktur' | 'recap') => Promise<void>;
  onDeleteSelected: () => Promise<boolean>;
  exporting: { type: string, status: boolean };
  loading: boolean;
}

export const SelectedActions: React.FC<SelectedActionsProps> = ({
  selectedCount,
  onClearSelection,
  onExportSelected,
  onDeleteSelected,
  exporting,
  loading
}) => {
  return (
    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md mb-4">
      <div className="text-sm">
        <span className="font-medium">{selectedCount}</span> faktur dipilih
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearSelection}
          className="h-8"
        >
          Batal
        </Button>
        
        {/* Dropdown menu for export options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={exporting.status}
              className="h-8"
            >
              {exporting.status ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Format Export</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onExportSelected('faktur')}
              disabled={exporting.status}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>Format Faktur</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onExportSelected('recap')}
              disabled={exporting.status}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>Rekapan Internal</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDeleteSelected}
          disabled={loading}
          className="h-8"
        >
          Hapus
        </Button>
      </div>
    </div>
  );
};