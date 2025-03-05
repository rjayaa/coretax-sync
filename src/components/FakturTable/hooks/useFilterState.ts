// import { useState, useEffect, useCallback } from 'react';
// import { DateRange } from 'react-day-picker';
// import { format } from 'date-fns';

// export const useFilterState = () => {
//   // Date filter states
//   const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined);
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined);
//   const [filterYear, setFilterYear] = useState<string | undefined>(undefined);
//   const [filterMonth, setFilterMonth] = useState<string | undefined>(undefined);
//   const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
//   const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
//   const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  
//   // Effect to update dateRange when startDate or endDate changes
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

//   // Effect to update startDate and endDate when dateRange changes
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
  
//   // Effect to ensure shortcut is not active if dateRange is changed manually
//   useEffect(() => {
//     if (dateRange && (
//       activeShortcut === 'month' && 
//       (dateRange.from?.getDate() !== 1 || 
//        dateRange.to?.getDate() !== new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate())
//     )) {
//       setActiveShortcut(null);
//     }
    
//     // If dateRange is removed, reset shortcut
//     if (!dateRange?.from && !dateRange?.to && activeShortcut) {
//       setActiveShortcut(null);
//     }
//   }, [dateRange, activeShortcut]);

//   // Function to activate shortcut and set date range
//   const activateShortcut = useCallback((shortcutType: string) => {
//     const today = new Date();
    
//     if (shortcutType === 'month') {
//       // Start of this month
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//       // End of this month
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
//       setDateRange({
//         from: startOfMonth,
//         to: endOfMonth
//       });
//       setActiveShortcut('month');
//     } else if (shortcutType === 'week') {
//       // 7 days ago
//       const last7Days = new Date();
//       last7Days.setDate(today.getDate() - 7);
      
//       setDateRange({
//         from: last7Days,
//         to: today
//       });
//       setActiveShortcut('week');
//     }
    
//     // Reset year/month filter if any
//     if (filterYear || filterMonth) {
//       setFilterYear(undefined);
//       setFilterMonth(undefined);
//     }
//   }, [filterYear, filterMonth]);

//   // Apply date filters
//   const applyDateFilters = useCallback(() => {
//     setIsFilterApplied(true);
//     setIsFilterExpanded(false); // Collapse filter panel after applying
//   }, []);

//   // Reset filter button
//   const clearDateFilters = useCallback(() => {
//     setDateRange(undefined);
//     setStartDate(undefined);
//     setEndDate(undefined);
//     setFilterYear(undefined);
//     setFilterMonth(undefined);
//     setIsFilterApplied(false);
//     setActiveShortcut(null); // Reset active shortcut
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

//   // Get filter params for API calls
//   const getFilterParams = useCallback(() => {
//     const params: any = {};
    
//     // Add date range if both dates are set
//     if (startDate && endDate) {
//       params.startDate = format(startDate, 'yyyy-MM-dd');
//       params.endDate = format(endDate, 'yyyy-MM-dd');
//     } 
//     // Otherwise use year/month filters if set
//     else {
//       if (filterYear) {
//         params.year = filterYear;
//       }
//       if (filterMonth) {
//         params.month = filterMonth;
//       }
//     }
    
//     return params;
//   }, [startDate, endDate, filterYear, filterMonth]);

//   return {
//     // States
//     dateRange,
//     setDateRange,
//     startDate,
//     endDate,
//     filterYear,
//     setFilterYear,
//     filterMonth, 
//     setFilterMonth,
//     isFilterApplied,
//     isFilterExpanded,
//     activeShortcut,
    
//     // Methods
//     activateShortcut,
//     applyDateFilters,
//     clearDateFilters,
//     toggleFilterExpanded,
//     getYearOptions,
//     getMonthOptions,
//     getFilterParams
//   };
// };
import { useState, useEffect, useCallback, useRef } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
// import { cloneDeep } from 'lodash'; // If you have lodash available

export const useFilterState = () => {
  // Date filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<string | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<string | undefined>(undefined);
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);
  
  // Flag to prevent circular updates
  const isUpdatingRef = useRef(false);
  
  // Effect to update dateRange when startDate or endDate changes
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    if (startDate || endDate) {
      setDateRange({
        from: startDate,
        to: endDate
      });
    } else {
      setDateRange(undefined);
    }
    isUpdatingRef.current = false;
  }, [startDate, endDate]);

  // Effect to update startDate and endDate when dateRange changes
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    if (dateRange) {
      setStartDate(dateRange.from);
      setEndDate(dateRange.to);
      
      // Clear year/month filters when using date range
      if (dateRange.from && dateRange.to && (filterYear || filterMonth)) {
        setFilterYear(undefined);
        setFilterMonth(undefined);
      }
    }
    isUpdatingRef.current = false;
  }, [dateRange, filterYear, filterMonth]);
  
  // Effect to ensure shortcut is not active if dateRange is changed manually
  useEffect(() => {
    if (!dateRange) return;
    
    if (activeShortcut === 'month' && 
      (dateRange.from?.getDate() !== 1 || 
       dateRange.to?.getDate() !== new Date(dateRange.to.getFullYear(), dateRange.to.getMonth() + 1, 0).getDate())
    ) {
      setActiveShortcut(null);
    }
    
    // If dateRange is removed, reset shortcut
    if (!dateRange.from && !dateRange.to && activeShortcut) {
      setActiveShortcut(null);
    }
  }, [dateRange, activeShortcut]);

  // Memoized filter params to prevent recreating on every render
  const filterParamsCache = useRef<any>({});
  
  // Function to activate shortcut and set date range
  const activateShortcut = useCallback((shortcutType: string) => {
    const today = new Date();
    
    if (shortcutType === 'month') {
      // Start of this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      // End of this month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      isUpdatingRef.current = true;
      setDateRange({
        from: startOfMonth,
        to: endOfMonth
      });
      setActiveShortcut('month');
      
      // Manually update startDate and endDate to avoid circular updates
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
      isUpdatingRef.current = false;
    } else if (shortcutType === 'week') {
      // 7 days ago
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 7);
      
      isUpdatingRef.current = true;
      setDateRange({
        from: last7Days,
        to: today
      });
      setActiveShortcut('week');
      
      // Manually update startDate and endDate to avoid circular updates
      setStartDate(last7Days);
      setEndDate(today);
      isUpdatingRef.current = false;
    }
    
    // Reset year/month filter if any
    if (filterYear || filterMonth) {
      setFilterYear(undefined);
      setFilterMonth(undefined);
    }
  }, [filterYear, filterMonth]);

  // Apply date filters
  const applyDateFilters = useCallback(() => {
    // Clear filter params cache to force recalculation
    filterParamsCache.current = {};
    
    setIsFilterApplied(true);
    setIsFilterExpanded(false); // Collapse filter panel after applying
  }, []);

  // Reset filter button
  const clearDateFilters = useCallback(() => {
    isUpdatingRef.current = true;
    setDateRange(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setFilterYear(undefined);
    setFilterMonth(undefined);
    setIsFilterApplied(false);
    setActiveShortcut(null); // Reset active shortcut
    isUpdatingRef.current = false;
    
    // Clear filter params cache
    filterParamsCache.current = {};
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

  // Get filter params for API calls - uses caching to prevent recreation
  const getFilterParams = useCallback(() => {
    // Generate a cache key based on current filter state
    const cacheKey = `${startDate?.toISOString()}_${endDate?.toISOString()}_${filterYear}_${filterMonth}`;
    
    // Return cached params if available
    if (filterParamsCache.current[cacheKey]) {
      return filterParamsCache.current[cacheKey];
    }
    
    const params: any = {};
    
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
    
    // Cache the result
    filterParamsCache.current[cacheKey] = params;
    
    // Use a deep clone to prevent reference issues if you have lodash
    return /* cloneDeep(params) */ {...params};
  }, [startDate, endDate, filterYear, filterMonth]);

  return {
    // States
    dateRange,
    setDateRange,
    startDate,
    endDate,
    filterYear,
    setFilterYear,
    filterMonth, 
    setFilterMonth,
    isFilterApplied,
    isFilterExpanded,
    activeShortcut,
    
    // Methods
    activateShortcut,
    applyDateFilters,
    clearDateFilters,
    toggleFilterExpanded,
    getYearOptions,
    getMonthOptions,
    getFilterParams
  };
};