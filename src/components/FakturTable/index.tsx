
// 'use client';

// import React, { useMemo } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { FakturData, DetailFakturData } from '@/types/faktur';
// import { useRouter } from 'next/navigation';

// // Import components
// import { SearchBar } from './components/SearchBar';
// import { FilterPanel } from './components/FilterPanel';
// import { FilterSummary } from './components/FilterSummary';
// import { SelectedActions } from './components/SelectedActions';
// import { TableContent } from './components/TableContent';
// import { Pagination } from './components/Pagination';
// import { ExportStatus } from './components/ExportStatus';

// // Import hooks
// import { useFilterState } from './hooks/useFilterState';
// import { useTableState } from './hooks/useTableState';
// import { useSelectionState } from './hooks/useSelectionState';
// import { useExportState } from './hooks/useExportState';

// // Extended interface to include faktur details
// interface FakturWithDetails extends FakturData {
//   id: string;
//   details?: DetailFakturData[];
// }

// interface FakturTableProps {
//   onCreateNew?: () => void;
//   onDataChange?: (data: FakturWithDetails[]) => void;
//   onEditFaktur?: (id: string) => void;
//   onSelectionChange?: (selectedIds: Set<string>) => void;
// }

// export const FakturTable: React.FC<FakturTableProps> = ({
//   onCreateNew,
//   onDataChange,
//   onEditFaktur,
//   onSelectionChange
// }) => {
//   const router = useRouter();
  
//   // Use filter state hook with useMemo to prevent recreations
//   const filterState = useFilterState();
  
//   // Extract values from filterState for clarity
//   const {
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
//     activateShortcut,
//     toggleFilterExpanded,
//     applyDateFilters,
//     clearDateFilters,
//     getYearOptions,
//     getMonthOptions,
//     getFilterParams
//   } = filterState;
  
//   // Memoize filterParams to prevent unnecessary re-renders
//   const filterParams = React.useMemo(() => getFilterParams(), [
//     getFilterParams, startDate, endDate, filterYear, filterMonth
//   ]);
  
//   // Use table state hook
//   const {
//     fakturs,
//     loading,
//     error,
//     searchTerm,
//     setSearchTerm,
//     page,
//     setPage,
//     totalPages,
//     limit,
//     setLimit,
//     fetchFakturs,
//     handleSearch,
//     handleRefresh
//   } = useTableState({ 
//     filterParams, 
//     isFilterApplied, 
//     onDataChange 
//   });
  
//   // Use selection state hook
//   const {
//     selectedFakturs,
//     setSelectedFakturs,
//     handleSelection,
//     handleSelectAll,
//     handleDeleteSelected
//   } = useSelectionState({ 
//     fakturs, 
//     onSelectionChange,
//     fetchFakturs 
//   });
  
//   // Use export state hook
//   const {
//     exporting,
//     handleExportSelected,
//     handleExportAll
//   } = useExportState({ 
//     fakturs, 
//     selectedFakturs 
//   });
  
//   // Handle edit faktur
//   const handleEditFaktur = (id: string) => {
//     if (onEditFaktur) {
//       onEditFaktur(id);
//     } else {
//       router.push(`/user/faktur/${id}/edit`);
//     }
//   };

//   return (
//     <Card className="w-full shadow-sm">
//       <CardContent className="p-4">
//         {/* Search and Action Bar */}
//         <SearchBar
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           handleSearch={handleSearch}
//           isFilterApplied={isFilterApplied}
//           toggleFilterExpanded={toggleFilterExpanded}
//           limit={limit}
//           setLimit={setLimit}
//           handleExportAll={handleExportAll}
//           handleRefresh={handleRefresh}
//           loading={loading}
//           exporting={exporting}
//         />
        
//         {/* Export Status */}
//         <ExportStatus exporting={exporting} />
        
//         {/* Date Filter Panel */}
//         {isFilterExpanded && (
//           <FilterPanel
//             dateRange={dateRange}
//             setDateRange={setDateRange}
//             filterYear={filterYear}
//             setFilterYear={setFilterYear}
//             filterMonth={filterMonth}
//             setFilterMonth={setFilterMonth}
//             activeShortcut={activeShortcut}
//             activateShortcut={activateShortcut}
//             toggleFilterExpanded={toggleFilterExpanded}
//             applyDateFilters={applyDateFilters}
//             clearDateFilters={clearDateFilters}
//             getYearOptions={getYearOptions}
//             getMonthOptions={getMonthOptions}
//           />
//         )}
        
//         {/* Filter Summary */}
//         {isFilterApplied && (
//           <FilterSummary
//             dateRange={dateRange}
//             filterYear={filterYear}
//             filterMonth={filterMonth}
//             getMonthOptions={getMonthOptions}
//             clearDateFilters={clearDateFilters}
//           />
//         )}
        
//         {/* Selected Items Actions */}
//         {selectedFakturs.size > 0 && (
//           <SelectedActions
//             selectedCount={selectedFakturs.size}
//             onClearSelection={() => setSelectedFakturs(new Set())}
//             onExportSelected={handleExportSelected}
//             onDeleteSelected={handleDeleteSelected}
//             exporting={exporting}
//             loading={loading}
//           />
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
//           <Pagination
//             page={page}
//             totalPages={totalPages}
//             limit={limit}
//             setPage={setPage}
//             loading={loading}
//             totalItems={fakturs.length}
//           />
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default FakturTable;
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FakturData, DetailFakturData } from '@/types/faktur';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import components
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { FilterSummary } from './components/FilterSummary';
import { SelectedActions } from './components/SelectedActions';
import { MainTableContent } from './components/MainTableContent';
import { ExportTableContent } from './components/ExportTableContent';
import { Pagination } from './components/Pagination';
import { ExportStatus } from './components/ExportStatus';

// Import hooks
import { useFilterState } from './hooks/useFilterState';
import { useTableState } from './hooks/useTableState';
import { useSelectionState } from './hooks/useSelectionState';
import { useExportState } from './hooks/useExportState';

// Extended interface to include faktur details
interface FakturWithDetails extends FakturData {
  id: string;
  details?: DetailFakturData[];
}

interface FakturTableProps {
  onCreateNew?: () => void;
  onDataChange?: (data: FakturWithDetails[]) => void;
  onEditFaktur?: (id: string) => void;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  mode?: 'main' | 'export'; // New prop to control the mode
}

export const FakturTable: React.FC<FakturTableProps> = ({
  onCreateNew,
  onDataChange,
  onEditFaktur,
  onSelectionChange,
  mode = 'main' // Default to main mode
}) => {
  const router = useRouter();
  const isExportMode = mode === 'export';
  
  // Use filter state hook with useMemo to prevent recreations
  const filterState = useFilterState();
  
  // Extract values from filterState for clarity
  const {
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
    activateShortcut,
    toggleFilterExpanded,
    applyDateFilters,
    clearDateFilters,
    getYearOptions,
    getMonthOptions,
    getFilterParams
  } = filterState;
  
  // Memoize filterParams to prevent unnecessary re-renders
  const filterParams = React.useMemo(() => getFilterParams(), [
    getFilterParams, startDate, endDate, filterYear, filterMonth
  ]);
  
  // Use table state hook
  const {
    fakturs,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    limit,
    setLimit,
    fetchFakturs,
    handleSearch,
    handleRefresh,
    deleteFaktur
  } = useTableState({ 
    filterParams, 
    isFilterApplied, 
    onDataChange 
  });
  
  // Use selection state hook
  const {
    selectedFakturs,
    setSelectedFakturs,
    handleSelection,
    handleSelectAll,
    handleDeleteSelected
  } = useSelectionState({ 
    fakturs, 
    onSelectionChange,
    fetchFakturs 
  });
  
  // Use export state hook
  const {
    exporting,
    handleExportSelected,
    handleExportAll
  } = useExportState({ 
    fakturs, 
    selectedFakturs 
  });
  
  // Handle edit faktur
  const handleEditFaktur = (id: string) => {
    if (onEditFaktur) {
      onEditFaktur(id);
    } else {
      router.push(`/user/faktur/${id}/edit`);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4">
        {/* Common elements for both modes */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium">
            {isExportMode ? 'Mode Export Faktur' : 'Data Faktur'}
          </div>
          
          {/* Refresh button always visible */}
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
        
        {/* Search bar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          isFilterApplied={isFilterApplied}
          toggleFilterExpanded={toggleFilterExpanded}
          limit={limit}
          setLimit={setLimit}
          handleExportAll={isExportMode ? handleExportAll : undefined}
          loading={loading}
          exporting={exporting}
          showExport={isExportMode}
        />
        
        {/* Export Status */}
        <ExportStatus exporting={exporting} />
        
        {/* Date Filter Panel */}
        {isFilterExpanded && (
          <FilterPanel
            dateRange={dateRange}
            setDateRange={setDateRange}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            activeShortcut={activeShortcut}
            activateShortcut={activateShortcut}
            toggleFilterExpanded={toggleFilterExpanded}
            applyDateFilters={applyDateFilters}
            clearDateFilters={clearDateFilters}
            getYearOptions={getYearOptions}
            getMonthOptions={getMonthOptions}
          />
        )}
        
        {/* Filter Summary */}
        {isFilterApplied && (
          <FilterSummary
            dateRange={dateRange}
            filterYear={filterYear}
            filterMonth={filterMonth}
            getMonthOptions={getMonthOptions}
            clearDateFilters={clearDateFilters}
          />
        )}
        
        {/* Export Mode: Selected Items Actions */}
        {isExportMode && selectedFakturs.size > 0 && (
          <SelectedActions
            selectedCount={selectedFakturs.size}
            onClearSelection={() => setSelectedFakturs(new Set())}
            onExportSelected={handleExportSelected}
            onDeleteSelected={handleDeleteSelected}
            exporting={exporting}
            loading={loading}
          />
        )}
        
        {/* Conditional Table Content based on mode */}
        {isExportMode ? (
          <ExportTableContent
            fakturs={fakturs}
            loading={loading}
            error={error}
            selectedIds={selectedFakturs}
            onSelect={handleSelection}
            onSelectAll={handleSelectAll}
            onEdit={handleEditFaktur}
            onDelete={deleteFaktur}
          />
        ) : (
          <MainTableContent
            fakturs={fakturs}
            loading={loading}
            error={error}
            onEdit={handleEditFaktur}
            onDelete={deleteFaktur}
          />
        )}
        
        {/* Pagination (common for both modes) */}
        {!loading && !error && fakturs.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            setPage={setPage}
            loading={loading}
            totalItems={fakturs.length}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FakturTable;