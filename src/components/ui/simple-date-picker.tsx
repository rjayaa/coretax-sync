'use client';

import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SimpleCalendar } from '@/components/ui/simple-calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface SimpleDateRangePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  align?: 'center' | 'start' | 'end';
  className?: string;
}

export function SimpleDateRangePicker({
  dateRange,
  setDateRange,
  startPlaceholder = 'Pilih tanggal awal',
  endPlaceholder = 'Pilih tanggal akhir',
  align = 'start',
  className
}: SimpleDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  // Update tempDateRange when dateRange changes
  useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  // Implement apply and close
  const handleApply = () => {
    if (tempDateRange) {
      setDateRange(tempDateRange);
    }
    setIsOpen(false);
  };

  // Reset and close
  const handleReset = () => {
    setTempDateRange(undefined);
    setDateRange(undefined);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-10 w-full",
              !dateRange?.from && !dateRange?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM yyyy", { locale: id })} &ndash;{" "}
                  {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: id })
              )
            ) : (
              <span>{startPlaceholder} &ndash; {endPlaceholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col p-3 w-auto" align={align}>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <div className="text-sm font-medium">Pilih Rentang Tanggal</div>
              {(tempDateRange?.from || tempDateRange?.to) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <SimpleCalendar
                mode="range"
                selected={tempDateRange}
                onSelect={setTempDateRange}
                className="border rounded-md"
              />
              
              <SimpleCalendar
                mode="range"
                selected={tempDateRange}
                onSelect={setTempDateRange}
                defaultMonth={addMonths(new Date(), 1)}
                className="border rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-2 border-t pt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                Batal
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply}
                disabled={!tempDateRange?.from || !tempDateRange?.to}
              >
                Terapkan
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SimpleDateRangePicker;