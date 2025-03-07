import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { Loader2, AlertCircle, Pencil, Trash2, Search, ArrowUpDown, CalendarIcon, ChevronDown, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, getMonth, getYear } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SimpleCalendar } from "@/components/ui/simple-calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Extended interface to include faktur details
interface FakturWithDetails extends FakturData {
  id: string;
  details?: DetailFakturData[];
}

interface MainTableContentProps {
  fakturs: FakturWithDetails[];
  loading: boolean;
  error: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}

// Type for sort direction
type SortDirection = 'asc' | 'desc' | null;

// Status Faktur options
const STATUS_OPTIONS = ['DRAFT', 'APPROVED', 'AMENDED', 'CANCELLED'];

// Component for text filter
const TextFilter = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  return (
    <div className="flex items-center space-x-1">
      <Input
        placeholder="Filter..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-[120px] text-xs"
      />
      <Search className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

// Component for date filter
const DateFilter = ({ value, onChange }: { value: Date | null, onChange: (date: Date | null) => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-8 px-2 text-xs justify-between min-w-[120px]">
          {value ? formatDate(value.toISOString()) : "Pilih Tanggal"}
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <SimpleCalendar
          mode="single"
          selected={value || undefined}
          onSelect={onChange}
          initialFocus
        />
        {value && (
          <div className="p-2 border-t flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Reset
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

// Component for month filter
const MonthFilter = ({ value, onChange }: { value: number | null, onChange: (month: number | null) => void }) => {
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  const selectedMonth = months.find(m => m.value === value);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2 text-xs justify-between min-w-[120px]">
          {selectedMonth ? selectedMonth.label : "Pilih Bulan"}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {months.map((month) => (
          <DropdownMenuItem key={month.value} onClick={() => onChange(month.value)}>
            {month.label}
          </DropdownMenuItem>
        ))}
        {value !== null && (
          <DropdownMenuItem onClick={() => onChange(null)} className="text-muted-foreground">
            Reset
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Component for year filter
const YearFilter = ({ value, onChange }: { value: number | null, onChange: (year: number | null) => void }) => {
  // Get last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2 text-xs justify-between min-w-[80px]">
          {value || "Tahun"}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {years.map((year) => (
          <DropdownMenuItem key={year} onClick={() => onChange(year)}>
            {year}
          </DropdownMenuItem>
        ))}
        {value !== null && (
          <DropdownMenuItem onClick={() => onChange(null)} className="text-muted-foreground">
            Reset
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Component for status filter
const StatusFilter = ({ value, onChange }: { 
  value: string | null, 
  onChange: (status: string | null) => void 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-2 text-xs justify-between min-w-[120px]">
          {value || "Pilih Status"}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuItem 
            key={status} 
            onClick={() => onChange(status)}
            className="flex items-center"
          >
            {value === status && <CheckIcon className="h-4 w-4 mr-2" />}
            <Badge 
              variant={
                status === 'APPROVED' ? "success" : 
                status === 'DRAFT' ? "default" : 
                status === 'AMENDED' ? "warning" : 
                status === 'CANCELLED' ? "destructive" : "default"
              }
              className="font-normal"
            >
              {status}
            </Badge>
          </DropdownMenuItem>
        ))}
        {value !== null && (
          <DropdownMenuItem onClick={() => onChange(null)} className="text-muted-foreground">
            Reset
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Component for sort button
const SortButton = ({ 
  direction, 
  onChange 
}: { 
  direction: SortDirection, 
  onChange: () => void 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 p-0 ml-1"
      onClick={onChange}
    >
      <ArrowUpDown 
        className={cn(
          "h-4 w-4", 
          direction === 'asc' ? "text-primary" : 
          direction === 'desc' ? "text-primary rotate-180" : 
          "text-muted-foreground"
        )} 
      />
    </Button>
  );
};

export const MainTableContent: React.FC<MainTableContentProps> = ({
  fakturs,
  loading,
  error,
  onEdit,
  onDelete
}) => {
  // Filter states
  const [npwpFilter, setNpwpFilter] = useState<string>('');
  const [namaFilter, setNamaFilter] = useState<string>('');
  const [kodeTransaksiFilter, setKodeTransaksiFilter] = useState<string>('');
  const [nomorFakturFilter, setNomorFakturFilter] = useState<string>('');
  const [referensiFilter, setReferensiFilter] = useState<string>('');
  const [tanggalFilter, setTanggalFilter] = useState<Date | null>(null);
  const [bulanFilter, setBulanFilter] = useState<number | null>(null);
  const [tahunFilter, setTahunFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Sort states
  const [dppSort, setDppSort] = useState<SortDirection>(null);
  const [dppNilaiLainSort, setDppNilaiLainSort] = useState<SortDirection>(null);
  const [ppnSort, setPpnSort] = useState<SortDirection>(null);
  const [ppnbmSort, setPpnbmSort] = useState<SortDirection>(null);

  // Function to calculate total PPN from details
  const calculateTotalPPN = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const ppn = parseFloat(detail.ppn || '0');
      return sum + (isNaN(ppn) ? 0 : ppn);
    }, 0);
  };

  // Function to calculate total DPP from details
  const calculateTotalDPP = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const dpp = parseFloat(detail.dpp || '0');
      return sum + (isNaN(dpp) ? 0 : dpp);
    }, 0);
  };

  // Function to calculate total DPP Nilai Lain from details
  const calculateTotalDPPNilaiLain = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const dppNilaiLain = parseFloat(detail.dpp_nilai_lain || '0');
      return sum + (isNaN(dppNilaiLain) ? 0 : dppNilaiLain);
    }, 0);
  };

  // Function to calculate total PPNBM from details
  const calculateTotalPPNBM = (details: DetailFakturData[] | undefined): number => {
    if (!details || details.length === 0) return 0;
    
    return details.reduce((sum, detail) => {
      const ppnbm = parseFloat(detail.ppnbm || '0');
      return sum + (isNaN(ppnbm) ? 0 : ppnbm);
    }, 0);
  };

  // Function to handle sort toggle
  const toggleSort = (
    currentDirection: SortDirection, 
    setDirection: React.Dispatch<React.SetStateAction<SortDirection>>,
    resetOthers: () => void
  ) => {
    // Reset other sort directions first
    resetOthers();
    
    // Toggle direction
    if (currentDirection === null) {
      setDirection('asc');
    } else if (currentDirection === 'asc') {
      setDirection('desc');
    } else {
      setDirection(null);
    }
  };

  // Reset all sorts except the specified one
  const resetOtherSorts = (keepSort: 'dpp' | 'dppNilaiLain' | 'ppn' | 'ppnbm') => {
    if (keepSort !== 'dpp') setDppSort(null);
    if (keepSort !== 'dppNilaiLain') setDppNilaiLainSort(null);
    if (keepSort !== 'ppn') setPpnSort(null);
    if (keepSort !== 'ppnbm') setPpnbmSort(null);
  };

  // Filter and sort the fakturs
  const filteredAndSortedFakturs = useMemo(() => {
    // First apply all filters
    let result = [...fakturs];
    
    // Apply text filters
    if (npwpFilter) {
      result = result.filter(faktur => 
        faktur.npwp_nik_pembeli?.toLowerCase().includes(npwpFilter.toLowerCase())
      );
    }
    
    if (namaFilter) {
      result = result.filter(faktur => 
        faktur.nama_pembeli?.toLowerCase().includes(namaFilter.toLowerCase())
      );
    }
    
    if (kodeTransaksiFilter) {
      result = result.filter(faktur => 
        faktur.kode_transaksi?.toLowerCase().includes(kodeTransaksiFilter.toLowerCase())
      );
    }
    
    if (nomorFakturFilter) {
      result = result.filter(faktur => 
        faktur.nomor_faktur_pajak?.toLowerCase().includes(nomorFakturFilter.toLowerCase())
      );
    }
    
    if (referensiFilter) {
      result = result.filter(faktur => 
        faktur.referensi?.toLowerCase().includes(referensiFilter.toLowerCase())
      );
    }
    
    // Apply date filter
    if (tanggalFilter) {
      const filterDate = new Date(tanggalFilter);
      result = result.filter(faktur => {
        if (!faktur.tanggal_faktur) return false;
        const fakturDate = new Date(faktur.tanggal_faktur);
        return (
          fakturDate.getDate() === filterDate.getDate() &&
          fakturDate.getMonth() === filterDate.getMonth() &&
          fakturDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }
    
    // Apply month filter
    if (bulanFilter !== null) {
      result = result.filter(faktur => {
        if (!faktur.tanggal_faktur) return false;
        const month = parseInt(getMonth(faktur.tanggal_faktur));
        return month === bulanFilter;
      });
    }
    
    // Apply year filter
    if (tahunFilter !== null) {
      result = result.filter(faktur => {
        if (!faktur.tanggal_faktur) return false;
        const year = parseInt(getYear(faktur.tanggal_faktur));
        return year === tahunFilter;
      });
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(faktur => 
        faktur.status_faktur === statusFilter
      );
    }
    
    // Then apply sorting
    if (dppSort) {
      result.sort((a, b) => {
        const valueA = calculateTotalDPP(a.details);
        const valueB = calculateTotalDPP(b.details);
        return dppSort === 'asc' ? valueA - valueB : valueB - valueA;
      });
    } else if (dppNilaiLainSort) {
      result.sort((a, b) => {
        const valueA = calculateTotalDPPNilaiLain(a.details);
        const valueB = calculateTotalDPPNilaiLain(b.details);
        return dppNilaiLainSort === 'asc' ? valueA - valueB : valueB - valueA;
      });
    } else if (ppnSort) {
      result.sort((a, b) => {
        const valueA = calculateTotalPPN(a.details);
        const valueB = calculateTotalPPN(b.details);
        return ppnSort === 'asc' ? valueA - valueB : valueB - valueA;
      });
    } else if (ppnbmSort) {
      result.sort((a, b) => {
        const valueA = calculateTotalPPNBM(a.details);
        const valueB = calculateTotalPPNBM(b.details);
        return ppnbmSort === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }
    
    return result;
  }, [
    fakturs, 
    npwpFilter, 
    namaFilter, 
    kodeTransaksiFilter, 
    nomorFakturFilter, 
    referensiFilter, 
    tanggalFilter, 
    bulanFilter, 
    tahunFilter,
    statusFilter,
    dppSort, 
    dppNilaiLainSort, 
    ppnSort,
    ppnbmSort
  ]);

  // Reset all filters
  const resetAllFilters = () => {
    setNpwpFilter('');
    setNamaFilter('');
    setKodeTransaksiFilter('');
    setNomorFakturFilter('');
    setReferensiFilter('');
    setTanggalFilter(null);
    setBulanFilter(null);
    setTahunFilter(null);
    setStatusFilter(null);
    setDppSort(null);
    setDppNilaiLainSort(null);
    setPpnSort(null);
    setPpnbmSort(null);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return "success";
      case 'DRAFT': return "default";
      case 'AMENDED': return "warning";
      case 'CANCELLED': return "destructive";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Memuat data faktur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-destructive">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (fakturs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p className="text-sm">Tidak ada data faktur yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter status and reset button */}
      {(npwpFilter || namaFilter || kodeTransaksiFilter || nomorFakturFilter || 
        referensiFilter || tanggalFilter || bulanFilter !== null || tahunFilter !== null || 
        statusFilter || dppSort || dppNilaiLainSort || ppnSort || ppnbmSort) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredAndSortedFakturs.length} dari {fakturs.length} faktur
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetAllFilters}
            className="text-xs"
          >
            Reset Filter
          </Button>
        </div>
      )}

      <div className="border rounded-md overflow-x-auto">
        <Table className='min-w-max'>
          <TableHeader>
            <TableRow>
              <TableHead>
                NPWP Pembeli
                <div className="mt-1">
                  <TextFilter value={npwpFilter} onChange={setNpwpFilter} />
                </div>
              </TableHead>
              <TableHead>
                Nama Pembeli
                <div className="mt-1">
                  <TextFilter value={namaFilter} onChange={setNamaFilter} />
                </div>
              </TableHead>
              <TableHead>
                Kode Transaksi
                <div className="mt-1">
                  <TextFilter value={kodeTransaksiFilter} onChange={setKodeTransaksiFilter} />
                </div>
              </TableHead>
              <TableHead>
                Nomor Faktur Pajak
                <div className="mt-1">
                  <TextFilter value={nomorFakturFilter} onChange={setNomorFakturFilter} />
                </div>
              </TableHead>
              <TableHead>
                Tanggal Faktur Pajak
                <div className="mt-1">
                  <DateFilter value={tanggalFilter} onChange={setTanggalFilter} />
                </div>
              </TableHead>
              <TableHead>
                Masa Pajak
                <div className="mt-1">
                  <MonthFilter value={bulanFilter} onChange={setBulanFilter} />
                </div>
              </TableHead>
              <TableHead>
                Tahun
                <div className="mt-1">
                  <YearFilter value={tahunFilter} onChange={setTahunFilter} />
                </div>
              </TableHead>
              <TableHead>
                Status Faktur
                <div className="mt-1">
                  <StatusFilter value={statusFilter} onChange={setStatusFilter} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Harga Jual/DPP
                  <SortButton 
                    direction={dppSort} 
                    onChange={() => toggleSort(dppSort, setDppSort, () => resetOtherSorts('dpp'))} 
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  DPP Nilai Lain
                  <SortButton 
                    direction={dppNilaiLainSort} 
                    onChange={() => toggleSort(dppNilaiLainSort, setDppNilaiLainSort, () => resetOtherSorts('dppNilaiLain'))} 
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  PPN
                  <SortButton 
                    direction={ppnSort} 
                    onChange={() => toggleSort(ppnSort, setPpnSort, () => resetOtherSorts('ppn'))} 
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  PPnBM
                  <SortButton 
                    direction={ppnbmSort} 
                    onChange={() => toggleSort(ppnbmSort, setPpnbmSort, () => resetOtherSorts('ppnbm'))} 
                  />
                </div>
              </TableHead>
              <TableHead>
                Referensi
                <div className="mt-1">
                  <TextFilter value={referensiFilter} onChange={setReferensiFilter} />
                </div>
              </TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedFakturs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-6 text-muted-foreground">
                  Tidak ada data yang sesuai dengan filter
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedFakturs.map((faktur) => (
                <TableRow 
                  key={`faktur-${faktur.id}`}
                  className="font-medium"
                >
                  <TableCell>{faktur.npwp_nik_pembeli}</TableCell>
                  <TableCell>{faktur.nama_pembeli}</TableCell>
                  <TableCell>{faktur.kode_transaksi}</TableCell>
                  <TableCell>{faktur.nomor_faktur_pajak}</TableCell>
                  <TableCell>{formatDate(faktur.tanggal_faktur)}</TableCell>
                  <TableCell>{getMonth(faktur.tanggal_faktur)}</TableCell>
                  <TableCell>{getYear(faktur.tanggal_faktur)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(faktur.status_faktur)}>
                      {faktur.status_faktur}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateTotalDPP(faktur.details))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateTotalDPPNilaiLain(faktur.details))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateTotalPPN(faktur.details))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateTotalPPNBM(faktur.details))}
                  </TableCell>
                  <TableCell>{faktur.referensi}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(faktur.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus Faktur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => onDelete(faktur.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};