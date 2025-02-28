// 'use client';

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { TableContent } from './TableContent';
// import { FakturData } from '@/types/faktur';
// import { FakturService } from '@/services/fakturService';
// import { toast } from '@/hooks/use-toast';
// import { generateExcelFile } from '@/lib/utils/excelGenerator';
// import { 
//   Loader2, 
//   Download, 
//   Search, 
//   RefreshCcw, 
//   Calendar as CalendarIcon, 
//   Filter, 
//   X
// } from 'lucide-react';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
// import { DateRange } from 'react-day-picker';
// import { format } from 'date-fns';
// import { id } from 'date-fns/locale';
// import SimpleDateRangePicker from '../ui/simple-date-picker';

// interface FakturTableProps {
//   onCreateNew?: () => void;
//   onDataChange?: (data: (FakturData & { id: string })[]) => void;
//   onEditFaktur?: (id: string) => void;
// }

// export const FakturTable: React.FC<FakturTableProps> = ({ 
//   onCreateNew,
//   onDataChange,
//   onEditFaktur
// }) => {
//   const router = useRouter();
//   const [fakturs, setFakturs] = useState<(FakturData & { id: string })[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [exporting, setExporting] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [selectedFakturs, setSelectedFakturs] = useState<Set<string>>(new Set());
//   const [page, setPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const [limit, setLimit] = useState<number>(10);
  
//   // Date filter states
//   const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined);
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined);
//   const [filterYear, setFilterYear] = useState<string | undefined>(undefined);
//   const [filterMonth, setFilterMonth] = useState<string | undefined>(undefined);
//   const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
//   const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
//   const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  
//   // Use a ref for the callback to prevent it from causing re-renders
//   const onDataChangeRef = useRef(onDataChange);
//   useEffect(() => {
//     onDataChangeRef.current = onDataChange;
//   }, [onDataChange]);
  
//   // Effect untuk mengupdate dateRange ketika startDate atau endDate berubah
//   useEffect(() => {
//     if (startDate || endDate) {
//       setDateRange({
//         from: startDate,
//         to: endDate
//       });
//     } else {
//       setDateRange(undefined);
//     }
//   }, [startDate, endDate]);

//   // Effect untuk mengupdate startDate dan endDate ketika dateRange berubah
//   useEffect(() => {
//     if (dateRange) {
//       setStartDate(dateRange.from);
//       setEndDate(dateRange.to);
      
//       // Clear year/month filters when using date range
//       if (dateRange.from && dateRange.to && (filterYear || filterMonth)) {
//         setFilterYear(undefined);
//         setFilterMonth(undefined);
//       }
//     }
//   }, [dateRange, filterYear, filterMonth]);
  
//   // Effect untuk memastikan shortcut tidak aktif jika dateRange diubah secara manual
//   useEffect(() => {
//     if (dateRange && (
//       activeShortcut === 'month' && 
//       (dateRange.from?.getDate() !== 1 || 
//        dateRange.to?.getDate() !== new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate())
//     )) {
//       setActiveShortcut(null);
//     }
    
//     // Jika dateRange dihapus, reset shortcut
//     if (!dateRange?.from && !dateRange?.to && activeShortcut) {
//       setActiveShortcut(null);
//     }
//   }, [dateRange, activeShortcut]);

//   // Fungsi untuk mengaktifkan shortcut dan mengatur date range
//   const activateShortcut = useCallback((shortcutType: string) => {
//     const today = new Date();
    
//     if (shortcutType === 'month') {
//       // Tanggal awal bulan ini
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//       // Akhir bulan ini
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
//       setDateRange({
//         from: startOfMonth,
//         to: endOfMonth
//       });
//       setActiveShortcut('month');
//     } else if (shortcutType === 'week') {
//       // 7 hari yang lalu
//       const last7Days = new Date();
//       last7Days.setDate(today.getDate() - 7);
      
//       setDateRange({
//         from: last7Days,
//         to: today
//       });
//       setActiveShortcut('week');
//     }
    
//     // Reset filter tahun/bulan jika ada
//     if (filterYear || filterMonth) {
//       setFilterYear(undefined);
//       setFilterMonth(undefined);
//     }
//   }, [setDateRange, filterYear, filterMonth]);

//   // Main data fetching function
//   const fetchFakturs = useCallback(async () => {
//     // Don't set loading here, as we already handle it in useEffect
//     console.log('Fetching fakturs with page:', page, 'limit:', limit, 'search:', searchTerm);
    
//     try {
//       // Prepare filter params
//       const params: any = {
//         page,
//         limit,
//         search: searchTerm
//       };
      
//       // Add date range if both dates are set
//       if (startDate && endDate) {
//         params.startDate = format(startDate, 'yyyy-MM-dd');
//         params.endDate = format(endDate, 'yyyy-MM-dd');
//       } 
//       // Otherwise use year/month filters if set
//       else {
//         if (filterYear) {
//           params.year = filterYear;
//         }
//         if (filterMonth) {
//           params.month = filterMonth;
//         }
//       }
      
//       console.log('Filter params:', params);
//       const response = await FakturService.getFakturs(params);
      
//       console.log('Fetched fakturs:', response.fakturs.length);
//       setFakturs(response.fakturs);
//       setTotalPages(response.pagination.totalPages);
      
//       // Call onDataChange callback if provided using the ref
//       if (onDataChangeRef.current) {
//         onDataChangeRef.current(response.fakturs);
//       }
      
//       return response;
//     } catch (err) {
//       console.error('Error fetching fakturs:', err);
//       setError('Failed to load faktur data');
//       toast({
//         title: 'Error',
//         description: 'Gagal memuat data faktur',
//         variant: 'destructive',
//       });
//       throw err;
//     }
//   }, [page, limit, searchTerm, startDate, endDate, filterYear, filterMonth]);

//   // Fetch data when params change (with loading state handling)
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         await fetchFakturs();
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadData();
//   }, [page, limit, searchTerm, startDate, endDate, filterYear, filterMonth, fetchFakturs]);

//   // Handle checkbox selection
//   const handleSelection = useCallback((id: string, isSelected: boolean) => {
//     setSelectedFakturs(prev => {
//       const newSelection = new Set(prev);
//       if (isSelected) {
//         newSelection.add(id);
//       } else {
//         newSelection.delete(id);
//       }
//       return newSelection;
//     });
//   }, []);

//   // Handle select all
//   const handleSelectAll = useCallback((isSelected: boolean) => {
//     if (isSelected) {
//       const allIds = fakturs.map(faktur => faktur.id);
//       setSelectedFakturs(new Set(allIds));
//     } else {
//       setSelectedFakturs(new Set());
//     }
//   }, [fakturs]);

//   // Navigate to detail/edit page
//   const handleEditFaktur = useCallback((id: string) => {
//     if (onEditFaktur) {
//       onEditFaktur(id);
//     } else {
//       router.push(`/user/faktur/${id}/edit`);
//     }
//   }, [router, onEditFaktur]);

//   // Export selected fakturs
//   const handleExportSelected = useCallback(async () => {
//     if (selectedFakturs.size === 0) {
//       toast({
//         title: 'Perhatian',
//         description: 'Pilih minimal satu faktur untuk di-export',
//         variant: 'default',
//       });
//       return;
//     }

//     setExporting(true);
//     try {
//       console.log(`Exporting ${selectedFakturs.size} selected fakturs`);
      
//       // Get complete data for selected fakturs including details
//       const selectedIds = Array.from(selectedFakturs);
      
//       // Log what we're attempting to export
//       console.log('Exporting faktur IDs:', selectedIds);
      
//       // Get faktur data with details
//       const fakturDataPromises = selectedIds.map(id => 
//         FakturService.getFakturWithDetails(id)
//           .catch(err => {
//             console.error(`Error fetching faktur ${id}:`, err);
//             return { faktur: null, details: [] };
//           })
//       );
      
//       const fakturDataResults = await Promise.all(fakturDataPromises);
      
//       // Filter out any null results (errors)
//       const validResults = fakturDataResults.filter(result => result.faktur !== null);
      
//       if (validResults.length === 0) {
//         throw new Error('No valid faktur data found');
//       }
      
//       // Flatten the results
//       const fakturList = validResults.map(result => result.faktur);
//       const detailList = validResults.flatMap(result => result.details);
      
//       console.log(`Found ${fakturList.length} fakturs with ${detailList.length} detail items`);

//       // Generate Excel file
//       generateExcelFile(fakturList, detailList);

//       toast({
//         title: 'Berhasil',
//         description: `${validResults.length} faktur berhasil di-export ke Excel`,
//       });
//     } catch (err) {
//       console.error('Error exporting fakturs:', err);
//       toast({
//         title: 'Error',
//         description: 'Gagal mengexport faktur ke Excel',
//         variant: 'destructive',
//       });
//     } finally {
//       setExporting(false);
//     }
//   }, [selectedFakturs]);

//   // Handle search
//   const handleSearch = useCallback((e: React.FormEvent) => {
//     e.preventDefault();
//     setPage(1); // Reset to first page on new search
//     // fetchFakturs() will be called via useEffect
//   }, []);

//   // Handle manual refresh
//   const handleRefresh = useCallback(() => {
//     setLoading(true);
//     fetchFakturs().finally(() => setLoading(false));
//   }, [fetchFakturs]);

//   // Delete selected fakturs
//   const handleDeleteSelected = useCallback(async () => {
//     if (selectedFakturs.size === 0) {
//       toast({
//         title: 'Perhatian',
//         description: 'Pilih minimal satu faktur untuk dihapus',
//         variant: 'default',
//       });
//       return;
//     }

//     if (!confirm(`Anda yakin ingin menghapus ${selectedFakturs.size} faktur?`)) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const selectedIds = Array.from(selectedFakturs);
//       const deletePromises = selectedIds.map(id => FakturService.deleteFaktur(id));
//       await Promise.all(deletePromises);

//       toast({
//         title: 'Berhasil',
//         description: `${selectedFakturs.size} faktur berhasil dihapus`,
//       });
      
//       // Reset selection and refresh data
//       setSelectedFakturs(new Set());
//       fetchFakturs();
//     } catch (err) {
//       console.error('Error deleting fakturs:', err);
//       toast({
//         title: 'Error',
//         description: 'Gagal menghapus faktur',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedFakturs, fetchFakturs]);

//   // Apply date filters
//   const applyDateFilters = useCallback(() => {
//     setPage(1); // Reset to first page when applying filters
//     setIsFilterApplied(true);
//     setIsFilterExpanded(false); // Collapse filter panel after applying
//     // fetchFakturs() will be called via useEffect
//   }, []);

//   // Reset filter tombol
//   const clearDateFilters = useCallback(() => {
//     setDateRange(undefined);
//     setStartDate(undefined);
//     setEndDate(undefined);
//     setFilterYear(undefined);
//     setFilterMonth(undefined);
//     setIsFilterApplied(false);
//     setActiveShortcut(null); // Reset shortcut aktif
//     setPage(1);
//     // This will trigger data refresh via useEffect
//   }, []);

//   // Toggle filter visibility
//   const toggleFilterExpanded = useCallback(() => {
//     setIsFilterExpanded(prev => !prev);
//   }, []);

//   // Generate year options (last 5 years)
//   const getYearOptions = useCallback(() => {
//     const currentYear = new Date().getFullYear();
//     const years = [];
//     for (let i = 0; i < 5; i++) {
//       years.push((currentYear - i).toString());
//     }
//     return years;
//   }, []);

//   // Generate month options
//   const getMonthOptions = useCallback(() => {
//     return [
//       { value: '01', label: 'Januari' },
//       { value: '02', label: 'Februari' },
//       { value: '03', label: 'Maret' },
//       { value: '04', label: 'April' },
//       { value: '05', label: 'Mei' },
//       { value: '06', label: 'Juni' },
//       { value: '07', label: 'Juli' },
//       { value: '08', label: 'Agustus' },
//       { value: '09', label: 'September' },
//       { value: '10', label: 'Oktober' },
//       { value: '11', label: 'November' },
//       { value: '12', label: 'Desember' },
//     ];
//   }, []);

//   console.log('Rendering FakturTable component', { 
//     loading, 
//     faktursLength: fakturs.length,
//     totalPages,
//     isFilterApplied
//   });

//   return (
//     <Card className="w-full shadow-sm">
//       <CardContent className="p-4">
//         {/* Search and Action Bar */}
//         <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
//           <form onSubmit={handleSearch} className="flex-1 flex gap-2">
//             <div className="relative flex-1">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
//               <Input
//                 type="search"
//                 placeholder="Cari faktur..."
//                 className="pl-9 h-9"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <Button type="submit" variant="outline" size="sm" className="shrink-0 h-9">
//               Cari
//             </Button>
//           </form>
          
//           <div className="flex items-center gap-2">
//             {/* Date Filter Toggle Button */}
//             <Button
//               variant={isFilterApplied ? "default" : "outline"} 
//               size="sm"
//               onClick={toggleFilterExpanded}
//               className="h-9 gap-1"
//             >
//               <Filter className="h-4 w-4" />
//               <span>Filter</span>
//               {isFilterApplied && (
//                 <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-medium text-primary">
//                   ✓
//                 </span>
//               )}
//             </Button>
            
//             <Select
//               value={limit.toString()}
//               onValueChange={(value) => {
//                 setLimit(parseInt(value));
//                 setPage(1); // Reset to first page when changing limit
//               }}
//             >
//               <SelectTrigger className="w-[80px] h-9">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="5">5</SelectItem>
//                 <SelectItem value="10">10</SelectItem>
//                 <SelectItem value="20">20</SelectItem>
//                 <SelectItem value="50">50</SelectItem>
//                 <SelectItem value="100">100</SelectItem>
//               </SelectContent>
//             </Select>
            
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               onClick={handleRefresh}
//               disabled={loading}
//               className="h-9 w-9 p-0"
//               title="Refresh"
//             >
//               {loading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <RefreshCcw className="h-4 w-4" />
//               )}
//               <span className="sr-only">Refresh</span>
//             </Button>
//           </div>
//         </div>

        
//         {/* Date Filter Panel dengan UI yang Diperbarui */}
// {isFilterExpanded && (
//   <div className="bg-card border rounded-md p-4 mb-4 space-y-4">
//     <div className="flex items-center justify-between border-b pb-2 mb-2">
//       <div className="flex items-center gap-2">
//         <CalendarIcon className="h-4 w-4 text-primary" />
//         <h3 className="text-sm font-medium">Filter Tanggal Faktur</h3>
//       </div>
//       <Button
//         variant="ghost"
//         size="sm"
//         onClick={toggleFilterExpanded}
//         className="h-7 w-7 p-0 rounded-full hover:bg-muted"
//       >
//         <X className="h-4 w-4" />
//         <span className="sr-only">Tutup</span>
//       </Button>
//     </div>
    
//     <div className="grid grid-cols-1 gap-4">
//       {/* Rentang Tanggal dengan UI yang Diperbarui */}
//       <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <div className="h-2 w-2 rounded-full bg-primary"></div>
//           <label className="text-sm font-medium">Rentang Tanggal</label>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <Button
//             variant={activeShortcut === 'month' ? "default" : "outline"}
//             size="sm"
//             onClick={() => activateShortcut('month')}
//             className="h-8 text-xs px-2"
//           >
//             Bulan Ini
//           </Button>
          
//           <Button
//             variant={activeShortcut === 'week' ? "default" : "outline"}
//             size="sm"
//             onClick={() => activateShortcut('week')}
//             className="h-8 text-xs px-2"
//           >
//             7 Hari Terakhir
//           </Button>
//         </div>
        
//         <SimpleDateRangePicker
//           dateRange={dateRange}
//           setDateRange={(range) => {
//             setDateRange(range);
//             // If using manual date selection, clear shortcut selection
//             if (range && activeShortcut) {
//               setActiveShortcut(null);
//             }
//             // If year/month filters are set, clear them when using date range
//             if (range && (filterYear || filterMonth)) {
//               setFilterYear(undefined);
//               setFilterMonth(undefined);
//             }
//           }}
//           startPlaceholder="Tanggal Awal"
//           endPlaceholder="Tanggal Akhir"
//         />
//       </div>
      
//       {/* Separator */}
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <span className="w-full border-t border-muted" />
//         </div>
//         <div className="relative flex justify-center">
//           <span className="bg-card px-2 text-xs text-muted-foreground">
//             atau
//           </span>
//         </div>
//       </div>
      
//       {/* Year/Month Filter dengan tampilan yang lebih baik */}
//       <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <div className="h-2 w-2 rounded-full bg-primary"></div>
//           <label className="text-sm font-medium">Filter Tahun/Bulan</label>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-2">
//           <Select
//             value={filterYear}
//             onValueChange={(value) => {
//               setFilterYear(value === "undefined" ? undefined : value);
//               // If date range is set, clear it when using year/month filters
//               if (value && dateRange) {
//                 setDateRange(undefined);
//                 setActiveShortcut(null);
//               }
//             }}
//           >
//             <SelectTrigger className="h-10 w-full">
//               <SelectValue placeholder="Pilih Tahun" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="undefined">Semua Tahun</SelectItem>
//               {getYearOptions().map(year => (
//                 <SelectItem key={year} value={year}>{year}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
          
//           <Select
//             value={filterMonth}
//             onValueChange={(value) => {
//               setFilterMonth(value === "undefined" ? undefined : value);
//               // If date range is set, clear it when using year/month filters
//               if (value && dateRange) {
//                 setDateRange(undefined);
//                 setActiveShortcut(null);
//               }
//             }}
//           >
//             <SelectTrigger className="h-10 w-full">
//               <SelectValue placeholder="Pilih Bulan" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="undefined">Semua Bulan</SelectItem>
//               {getMonthOptions().map(month => (
//                 <SelectItem key={month.value} value={month.value}>
//                   {month.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </div>
    
//     {/* Tombol action lebih profesional */}
//     <div className="flex justify-end gap-2 pt-3 border-t border-border mt-2">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={clearDateFilters}
//         className="h-9"
//       >
//         Reset
//       </Button>
//       <Button
//         size="sm"
//         onClick={applyDateFilters}
//         className="h-9"
//         disabled={
//           (dateRange?.from && !dateRange?.to) || 
//           (!dateRange?.from && dateRange?.to) || 
//           (!dateRange?.from && !dateRange?.to && !filterYear && !filterMonth)
//         }
//       >
//         Terapkan Filter
//       </Button>
//     </div>
//   </div>
// )}

//         {/* Filter Summary yang lebih terlihat */}
//         {isFilterApplied && (
//           <div className="bg-primary/5 rounded-md p-3 mb-4 flex items-center justify-between border border-primary/20">
//             <div className="flex items-center gap-2">
//               <div className="rounded-full bg-primary/10 p-1.5">
//                 <Filter className="h-4 w-4 text-primary" />
//               </div>
//               <div>
//                 <span className="text-sm font-medium">Filter Aktif: </span>
//                 <span className="text-sm">
//                   {dateRange?.from && dateRange?.to ? (
//                     <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
//                       {format(dateRange.from, "dd-MM-yyyy", { locale: id })} s/d {format(dateRange.to, "dd-MM-yyyy", { locale: id })}
//                     </span>
//                   ) : filterYear && filterMonth ? (
//                     <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
//                       {getMonthOptions().find(m => m.value === filterMonth)?.label} {filterYear}
//                     </span>
//                   ) : filterYear ? (
//                     <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
//                       Tahun {filterYear}
//                     </span>
//                   ) : filterMonth ? (
//                     <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs ml-1">
//                       {getMonthOptions().find(m => m.value === filterMonth)?.label} {new Date().getFullYear()}
//                     </span>
//                   ) : null}
//                 </span>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearDateFilters}
//               className="h-8 hover:bg-destructive/10 hover:text-destructive"
//             >
//               <X className="h-3.5 w-3.5 mr-1" />
//               <span className="text-xs">Hapus Filter</span>
//             </Button>
//           </div>
//         )}
        
//         {/* Selected items actions */}
//         {selectedFakturs.size > 0 && (
//           <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md mb-4">
//             <div className="text-sm">
//               <span className="font-medium">{selectedFakturs.size}</span> faktur dipilih
//             </div>
//             <div className="flex gap-2">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 onClick={() => setSelectedFakturs(new Set())}
//                 className="h-8"
//               >
//                 Batal
//               </Button>
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 onClick={handleExportSelected}
//                 disabled={exporting}
//                 className="h-8"
//               >
//                 {exporting ? (
//                   <Loader2 className="h-3 w-3 animate-spin mr-1" />
//                 ) : (
//                   <Download className="h-3 w-3 mr-1" />
//                 )}
//                 Export Excel
//               </Button>
//               <Button 
//                 variant="destructive" 
//                 size="sm" 
//                 onClick={handleDeleteSelected}
//                 disabled={loading}
//                 className="h-8"
//               >
//                 Hapus
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <TableContent
//           fakturs={fakturs}
//           loading={loading}
//           error={error}
//           selectedIds={selectedFakturs}
//           onSelect={handleSelection}
//           onSelectAll={handleSelectAll}
//           onEdit={handleEditFaktur}
//         />

//         {/* Pagination */}
//         {!loading && !error && fakturs.length > 0 && (
//           <div className="flex justify-between items-center mt-4 text-sm">
//             <div className="text-muted-foreground">
//               Menampilkan {fakturs.length} dari {(page - 1) * limit + 1} - {Math.min(page * limit, totalPages * limit)} faktur
//             </div>
//             <div className="flex gap-1">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page <= 1 || loading}
//                 className="h-8 px-3"
//               >
//                 Prev
//               </Button>
              
//               <div className="flex items-center px-2">
//                 <span className="text-sm">{page} / {totalPages}</span>
//               </div>
              
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage(p => p + 1)}
//                 disabled={page >= totalPages || loading}
//                 className="h-8 px-3"
//               >
//                 Next
//               </Button>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default FakturTable;
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableContent } from './TableContent';
import { FakturData } from '@/types/faktur';
import { FakturService } from '@/services/fakturService';
import { toast } from '@/hooks/use-toast';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { generateInternalRecapExcelFile } from '@/lib/utils/excelGeneratorInternal';
import { 
  Loader2, 
  Download, 
  Search, 
  RefreshCcw, 
  Calendar as CalendarIcon, 
  Filter, 
  X,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import SimpleDateRangePicker from '../ui/simple-date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface FakturTableProps {
  onCreateNew?: () => void;
  onDataChange?: (data: (FakturData & { id: string })[]) => void;
  onEditFaktur?: (id: string) => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export const FakturTable: React.FC<FakturTableProps> = ({ 
  onCreateNew,
  onDataChange,
  onEditFaktur,
  onSelectionChange
}) => {
  const router = useRouter();
  const [fakturs, setFakturs] = useState<(FakturData & { id: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<{ type: string, status: boolean }>({ type: '', status: false });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFakturs, setSelectedFakturs] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  
  // Date filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<string | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<string | undefined>(undefined);
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  
  // Use a ref for the callback to prevent it from causing re-renders
  const onDataChangeRef = useRef(onDataChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
    onSelectionChangeRef.current = onSelectionChange;
  }, [onDataChange, onSelectionChange]);
  
  // Efek untuk meneruskan perubahan seleksi ke parent component
  useEffect(() => {
    if (onSelectionChangeRef.current) {
      onSelectionChangeRef.current(selectedFakturs);
    }
  }, [selectedFakturs]);
  
  // Effect untuk mengupdate dateRange ketika startDate atau endDate berubah
  useEffect(() => {
    if (startDate || endDate) {
      setDateRange({
        from: startDate,
        to: endDate
      });
    } else {
      setDateRange(undefined);
    }
  }, [startDate, endDate]);

  // Effect untuk mengupdate startDate dan endDate ketika dateRange berubah
  useEffect(() => {
    if (dateRange) {
      setStartDate(dateRange.from);
      setEndDate(dateRange.to);
      
      // Clear year/month filters when using date range
      if (dateRange.from && dateRange.to && (filterYear || filterMonth)) {
        setFilterYear(undefined);
        setFilterMonth(undefined);
      }
    }
  }, [dateRange, filterYear, filterMonth]);
  
  // Effect untuk memastikan shortcut tidak aktif jika dateRange diubah secara manual
  useEffect(() => {
    if (dateRange && (
      activeShortcut === 'month' && 
      (dateRange.from?.getDate() !== 1 || 
       dateRange.to?.getDate() !== new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate())
    )) {
      setActiveShortcut(null);
    }
    
    // Jika dateRange dihapus, reset shortcut
    if (!dateRange?.from && !dateRange?.to && activeShortcut) {
      setActiveShortcut(null);
    }
  }, [dateRange, activeShortcut]);

  // Fungsi untuk mengaktifkan shortcut dan mengatur date range
  const activateShortcut = useCallback((shortcutType: string) => {
    const today = new Date();
    
    if (shortcutType === 'month') {
      // Tanggal awal bulan ini
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      // Akhir bulan ini
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setDateRange({
        from: startOfMonth,
        to: endOfMonth
      });
      setActiveShortcut('month');
    } else if (shortcutType === 'week') {
      // 7 hari yang lalu
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 7);
      
      setDateRange({
        from: last7Days,
        to: today
      });
      setActiveShortcut('week');
    }
    
    // Reset filter tahun/bulan jika ada
    if (filterYear || filterMonth) {
      setFilterYear(undefined);
      setFilterMonth(undefined);
    }
  }, [setDateRange, filterYear, filterMonth]);

  // Main data fetching function
  const fetchFakturs = useCallback(async () => {
    // Don't set loading here, as we already handle it in useEffect
    console.log('Fetching fakturs with page:', page, 'limit:', limit, 'search:', searchTerm);
    
    try {
      // Prepare filter params
      const params: any = {
        page,
        limit,
        search: searchTerm
      };
      
      // Add date range if both dates are set
      if (startDate && endDate) {
        params.startDate = format(startDate, 'yyyy-MM-dd');
        params.endDate = format(endDate, 'yyyy-MM-dd');
      } 
      // Otherwise use year/month filters if set
      else {
        if (filterYear) {
          params.year = filterYear;
        }
        if (filterMonth) {
          params.month = filterMonth;
        }
      }
      
      console.log('Filter params:', params);
      const response = await FakturService.getFakturs(params);
      
      console.log('Fetched fakturs:', response.fakturs.length);
      setFakturs(response.fakturs);
      setTotalPages(response.pagination.totalPages);
      
      // Call onDataChange callback if provided using the ref
      if (onDataChangeRef.current) {
        onDataChangeRef.current(response.fakturs);
      }
      
      return response;
    } catch (err) {
      console.error('Error fetching fakturs:', err);
      setError('Failed to load faktur data');
      toast({
        title: 'Error',
        description: 'Gagal memuat data faktur',
        variant: 'destructive',
      });
      throw err;
    }
  }, [page, limit, searchTerm, startDate, endDate, filterYear, filterMonth]);

  // Fetch data when params change (with loading state handling)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchFakturs();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [page, limit, searchTerm, startDate, endDate, filterYear, filterMonth, fetchFakturs]);

  // Handle checkbox selection
  const handleSelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedFakturs(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) {
      const allIds = fakturs.map(faktur => faktur.id);
      setSelectedFakturs(new Set(allIds));
    } else {
      setSelectedFakturs(new Set());
    }
  }, [fakturs]);

  // Navigate to detail/edit page
  const handleEditFaktur = useCallback((id: string) => {
    if (onEditFaktur) {
      onEditFaktur(id);
    } else {
      router.push(`/user/faktur/${id}/edit`);
    }
  }, [router, onEditFaktur]);

  // Export selected fakturs - mendukung format faktur dan rekapan internal
  const handleExportSelected = useCallback(async (format: 'faktur' | 'recap') => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk di-export',
        variant: 'default',
      });
      return;
    }

    setExporting({ type: format, status: true });
    try {
      console.log(`Exporting ${selectedFakturs.size} selected fakturs as ${format}`);
      
      // Get complete data for selected fakturs including details
      const selectedIds = Array.from(selectedFakturs);
      
      // Log what we're attempting to export
      console.log('Exporting faktur IDs:', selectedIds);
      
      // Get faktur data with details
      const fakturDataPromises = selectedIds.map(id => 
        FakturService.getFakturWithDetails(id)
          .catch(err => {
            console.error(`Error fetching faktur ${id}:`, err);
            return { faktur: null, details: [] };
          })
      );
      
      const fakturDataResults = await Promise.all(fakturDataPromises);
      
      // Filter out any null results (errors)
      const validResults = fakturDataResults.filter(result => result.faktur !== null);
      
      if (validResults.length === 0) {
        throw new Error('No valid faktur data found');
      }
      
      // Flatten the results
      const fakturList = validResults.map(result => result.faktur);
      const detailList = validResults.flatMap(result => result.details);
      
      console.log(`Found ${fakturList.length} fakturs with ${detailList.length} detail items`);

      // Generate Excel file berdasarkan format yang dipilih
      if (format === 'faktur') {
        generateExcelFile(fakturList, detailList);
        toast({
          title: 'Berhasil',
          description: `${validResults.length} faktur berhasil di-export ke Excel`,
        });
      } else {
        generateInternalRecapExcelFile(fakturList, detailList);
        toast({
          title: 'Berhasil',
          description: `Rekapan internal berhasil di-export ke Excel`,
        });
      }
    } catch (err) {
      console.error('Error exporting fakturs:', err);
      toast({
        title: 'Error',
        description: `Gagal mengexport ${format === 'faktur' ? 'faktur' : 'rekapan internal'} ke Excel`,
        variant: 'destructive',
      });
    } finally {
      setExporting({ type: '', status: false });
    }
  }, [selectedFakturs]);

  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    // fetchFakturs() will be called via useEffect
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchFakturs().finally(() => setLoading(false));
  }, [fetchFakturs]);

  // Delete selected fakturs
  const handleDeleteSelected = useCallback(async () => {
    if (selectedFakturs.size === 0) {
      toast({
        title: 'Perhatian',
        description: 'Pilih minimal satu faktur untuk dihapus',
        variant: 'default',
      });
      return;
    }

    if (!confirm(`Anda yakin ingin menghapus ${selectedFakturs.size} faktur?`)) {
      return;
    }

    setLoading(true);
    try {
      const selectedIds = Array.from(selectedFakturs);
      const deletePromises = selectedIds.map(id => FakturService.deleteFaktur(id));
      await Promise.all(deletePromises);

      toast({
        title: 'Berhasil',
        description: `${selectedFakturs.size} faktur berhasil dihapus`,
      });
      
      // Reset selection and refresh data
      setSelectedFakturs(new Set());
      fetchFakturs();
    } catch (err) {
      console.error('Error deleting fakturs:', err);
      toast({
        title: 'Error',
        description: 'Gagal menghapus faktur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedFakturs, fetchFakturs]);

  // Apply date filters
  const applyDateFilters = useCallback(() => {
    setPage(1); // Reset to first page when applying filters
    setIsFilterApplied(true);
    setIsFilterExpanded(false); // Collapse filter panel after applying
    // fetchFakturs() will be called via useEffect
  }, []);

  // Reset filter tombol
  const clearDateFilters = useCallback(() => {
    setDateRange(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setFilterYear(undefined);
    setFilterMonth(undefined);
    setIsFilterApplied(false);
    setActiveShortcut(null); // Reset shortcut aktif
    setPage(1);
    // This will trigger data refresh via useEffect
  }, []);

  // Toggle filter visibility
  const toggleFilterExpanded = useCallback(() => {
    setIsFilterExpanded(prev => !prev);
  }, []);

  // Generate year options (last 5 years)
  const getYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  }, []);

  // Generate month options
  const getMonthOptions = useCallback(() => {
    return [
      { value: '01', label: 'Januari' },
      { value: '02', label: 'Februari' },
      { value: '03', label: 'Maret' },
      { value: '04', label: 'April' },
      { value: '05', label: 'Mei' },
      { value: '06', label: 'Juni' },
      { value: '07', label: 'Juli' },
      { value: '08', label: 'Agustus' },
      { value: '09', label: 'September' },
      { value: '10', label: 'Oktober' },
      { value: '11', label: 'November' },
      { value: '12', label: 'Desember' },
    ];
  }, []);

  console.log('Rendering FakturTable component', { 
    loading, 
    faktursLength: fakturs.length,
    totalPages,
    isFilterApplied
  });

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4">
        {/* Search and Action Bar */}
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
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1); // Reset to first page when changing limit
              }}
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
            
            {/* Tombol Export untuk semua data */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
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
                  onClick={() => {
                    setExporting({ type: 'faktur', status: true });
                    
                    // Export semua data yang ditampilkan saat ini
                    const fakturListToExport = [...fakturs];
                    
                    const fetchDetails = async () => {
                      try {
                        const detailPromises = fakturListToExport.map(faktur => 
                          FakturService.getFakturDetails(faktur.id)
                        );
                        
                        const allDetails = await Promise.all(detailPromises);
                        const flattenedDetails = allDetails.flat();
                        
                        generateExcelFile(fakturListToExport, flattenedDetails);
                        toast({
                          title: "Berhasil",
                          description: "File excel berhasil di-generate",
                        });
                      } catch (error) {
                        console.error('Error exporting Excel:', error);
                        toast({
                          title: "Error",
                          description: "Gagal mengexport file excel",
                          variant: "destructive",
                        });
                      } finally {
                        setExporting({ type: '', status: false });
                      }
                    };
                    
                    fetchDetails();
                  }}
                  disabled={exporting.status}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Format Faktur</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setExporting({ type: 'recap', status: true });
                    
                    // Export semua data yang ditampilkan saat ini
                    const fakturListToExport = [...fakturs];
                    
                    const fetchDetails = async () => {
                      try {
                        const detailPromises = fakturListToExport.map(faktur => 
                          FakturService.getFakturDetails(faktur.id)
                        );
                        
                        const allDetails = await Promise.all(detailPromises);
                        const flattenedDetails = allDetails.flat();
                        
                        generateInternalRecapExcelFile(fakturListToExport, flattenedDetails);
                        toast({
                          title: "Berhasil",
                          description: "Rekapan internal berhasil di-generate",
                        });
                      } catch (error) {
                        console.error('Error exporting internal recap:', error);
                        toast({
                          title: "Error",
                          description: "Gagal mengexport rekapan internal",
                          variant: "destructive",
                        });
                      } finally {
                        setExporting({ type: '', status: false });
                      }
                    };
                    
                    fetchDetails();
                  }}
                  disabled={exporting.status}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Rekapan Internal</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-9 w-9 p-0"
              title="Refresh"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Status export sedang berlangsung */}
        {exporting.status && (
          <div className="bg-primary/10 text-primary rounded-md p-2 mt-2 mb-4 flex items-center justify-center text-sm animate-pulse">
            <span>Sedang mengexport {exporting.type === 'faktur' ? 'format faktur' : 'rekapan internal'}, mohon tunggu...</span>
          </div>
        )}
        
        {/* Date Filter Panel dengan UI yang Diperbarui */}
        {isFilterExpanded && (
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
              {/* Rentang Tanggal dengan UI yang Diperbarui */}
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
                  setDateRange={(range) => {
                    setDateRange(range);
                    // If using manual date selection, clear shortcut selection
                    if (range && activeShortcut) {
                      setActiveShortcut(null);
                    }
                    // If year/month filters are set, clear them when using date range
                    if (range && (filterYear || filterMonth)) {
                      setFilterYear(undefined);
                      setFilterMonth(undefined);
                    }
                  }}
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
              
              {/* Year/Month Filter dengan tampilan yang lebih baik */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <label className="text-sm font-medium">Filter Tahun/Bulan</label>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={filterYear}
                    onValueChange={(value) => {
                      setFilterYear(value === "undefined" ? undefined : value);
                      // If date range is set, clear it when using year/month filters
                      if (value && dateRange) {
                        setDateRange(undefined);
                        setActiveShortcut(null);
                      }
                    }}
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
                    onValueChange={(value) => {
                      setFilterMonth(value === "undefined" ? undefined : value);
                      // If date range is set, clear it when using year/month filters
                      if (value && dateRange) {
                        setDateRange(undefined);
                        setActiveShortcut(null);
                      }
                    }}
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
            
            {/* Tombol action lebih profesional */}
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
        )}

        {/* Filter Summary yang lebih terlihat */}
        {isFilterApplied && (
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
        )}
        
        {/* Selected items actions */}
        {selectedFakturs.size > 0 && (
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md mb-4">
            <div className="text-sm">
              <span className="font-medium">{selectedFakturs.size}</span> faktur dipilih
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedFakturs(new Set())}
                className="h-8"
              >
                Batal
              </Button>
              
              {/* Dropdown menu untuk opsi export dari faktur terpilih */}
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
                    onClick={() => handleExportSelected('faktur')}
                    disabled={exporting.status}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    <span>Format Faktur</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExportSelected('recap')}
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
                onClick={handleDeleteSelected}
                disabled={loading}
                className="h-8"
              >
                Hapus
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <TableContent
          fakturs={fakturs}
          loading={loading}
          error={error}
          selectedIds={selectedFakturs}
          onSelect={handleSelection}
          onSelectAll={handleSelectAll}
          onEdit={handleEditFaktur}
        />

        {/* Pagination */}
        {!loading && !error && fakturs.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="text-muted-foreground">
              Menampilkan {fakturs.length} dari {(page - 1) * limit + 1} - {Math.min(page * limit, totalPages * limit)} faktur
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
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
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages || loading}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FakturTable;