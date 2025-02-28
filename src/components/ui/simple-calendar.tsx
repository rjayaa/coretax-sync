'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from: Date; to: Date } | undefined;
  onSelect?: (date: Date | { from: Date; to: Date } | undefined) => void;
  defaultMonth?: Date;
  className?: string;
  disabled?: boolean;
}

export function SimpleCalendar({
  mode = 'single',
  selected,
  onSelect,
  defaultMonth = new Date(),
  className,
  disabled = false
}: CalendarProps) {
  const [month, setMonth] = React.useState(defaultMonth);

  // Menghitung hari yang ditampilkan
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Nama hari dalam bahasa Indonesia
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  // Mendapatkan tanggal untuk minggu pertama bulan ini
  const firstDayOfWeek = monthStart.getDay(); // 0 = Minggu, 1 = Senin, ...
  const startingDayIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mengkonversi ke format Senin=0, Minggu=6
  
  // Menghitung tanggal untuk grid kalender lengkap (termasuk hari dari bulan sebelum/sesudah)
  const daysToShow = Array(42).fill(null).map((_, index) => {
    const dayIndex = index - startingDayIndex;
    const date = new Date(monthStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  });

  // Fungsi untuk menangani klik pada tanggal
  const handleDateClick = (date: Date) => {
    if (disabled) return;
    
    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'range') {
      if (!selected) {
        onSelect?.({ from: date, to: undefined });
      } else if (typeof selected !== 'object' || !selected.from) {
        onSelect?.({ from: date, to: undefined });
      } else if (selected.from && !selected.to) {
        // Jika tanggal yang dipilih lebih awal dari tanggal mulai, tukar posisinya
        if (date < selected.from) {
          onSelect?.({ from: date, to: selected.from });
        } else {
          onSelect?.({ from: selected.from, to: date });
        }
      } else {
        onSelect?.({ from: date, to: undefined });
      }
    }
  };

  // Fungsi untuk memeriksa apakah tanggal dipilih
  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    
    if (mode === 'single') {
      return typeof selected !== 'object' && isSameDay(date, selected);
    } else if (mode === 'range' && typeof selected === 'object') {
      if (selected.from && selected.to) {
        return (
          isSameDay(date, selected.from) || 
          isSameDay(date, selected.to) || 
          (date > selected.from && date < selected.to)
        );
      }
      return selected.from ? isSameDay(date, selected.from) : false;
    }
    
    return false;
  };
  
  // Fungsi untuk memeriksa apakah tanggal adalah start/end dari range
  const isRangeStart = (date: Date) => {
    if (mode !== 'range' || !selected || typeof selected !== 'object' || !selected.from) return false;
    return isSameDay(date, selected.from);
  };
  
  const isRangeEnd = (date: Date) => {
    if (mode !== 'range' || !selected || typeof selected !== 'object' || !selected.to) return false;
    return isSameDay(date, selected.to);
  };
  
  const isInRange = (date: Date) => {
    if (mode !== 'range' || !selected || typeof selected !== 'object' || !selected.from || !selected.to) return false;
    return date > selected.from && date < selected.to;
  };

  return (
    <div className={cn("p-3 w-full max-w-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth(subMonths(month, 1))}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Bulan sebelumnya</span>
        </Button>
        
        <div className="text-sm font-medium">
          {format(month, 'MMMM yyyy', { locale: id })}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Bulan berikutnya</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground h-8 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {daysToShow.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, month);
          const isSelectedDate = isDateSelected(date);
          const isCurrentDate = isToday(date);
          const isStartDate = isRangeStart(date);
          const isEndDate = isRangeEnd(date);
          const isWithinRange = isInRange(date);
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 p-0 font-normal text-xs rounded-full",
                !isCurrentMonth && "text-muted-foreground opacity-30",
                isSelectedDate && mode === 'single' && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isStartDate && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isEndDate && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isWithinRange && "bg-primary/10 text-primary-foreground rounded-none",
                isCurrentDate && !isSelectedDate && "bg-accent text-accent-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleDateClick(date)}
              disabled={disabled || !isCurrentMonth}
            >
              {date.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default SimpleCalendar;