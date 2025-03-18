// src/app/export/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { generateExcelFile } from '@/lib/utils/excelGenerator';
import { generateInternalRecapExcelFile } from '@/lib/utils/excelGeneratorInternal';
import { FakturData, DetailFakturData } from '@/types/faktur';

// Define extended types for local use
interface FakturWithId extends FakturData {
  id: string;
  is_uploaded_to_coretax: boolean;
}

export default function ExportPage() {
  const [fakturs, setFakturs] = useState<FakturWithId[]>([]);
  const [selectedFakturs, setSelectedFakturs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    synced: '',
    searchQuery: '',
    startDate: '',
    endDate: ''
  });
  const [selectedCompany, setSelectedCompany] = useState<{ npwp_company?: string; company_name?: string } | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportType, setExportType] = useState<'coretax' | 'internal'>('coretax');
  
  // Pagination state - added to match faktur page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Now configurable

  // Get selected company from localStorage on component mount
  useEffect(() => {
    const selectedCompanyStr = localStorage.getItem('selectedCompany');
    if (selectedCompanyStr) {
      try {
        const company = JSON.parse(selectedCompanyStr);
        setSelectedCompany(company);
      } catch (err) {
        console.error('Error parsing selected company from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchFakturs();
  }, [currentPage, itemsPerPage, filter, selectedCompany]); // Added selectedCompany as dependency

  const fetchFakturs = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters - same as faktur page
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (filter.status) params.append('status', filter.status);
      if (filter.synced) params.append('synced', filter.synced);
      if (filter.searchQuery) params.append('search', filter.searchQuery);
      
      // Try multiple parameter names for date filtering to ensure compatibility
      if (filter.startDate) {
        params.append('tanggalMulai', filter.startDate);
        params.append('startDate', filter.startDate);
        params.append('start_date', filter.startDate);
        // Format tanggal_faktur specifically (YYYY-MM-DD format)
        params.append('tanggal_faktur_start', filter.startDate);
      }
      
      if (filter.endDate) {
        params.append('tanggalAkhir', filter.endDate);
        params.append('endDate', filter.endDate);
        params.append('end_date', filter.endDate);
        // Format tanggal_faktur specifically (YYYY-MM-DD format)
        params.append('tanggal_faktur_end', filter.endDate);
      }
      
      // Add company NPWP filter
      if (selectedCompany?.npwp_company) {
        params.append('npwp_penjual', selectedCompany.npwp_company);
      }
      
      // Debug log to verify parameters
      console.log('API Parameters:', params.toString());
      
      // Using the same API endpoint as faktur page
      const response = await fetch(`/api/faktur?${params.toString()}`);
      
      if (!response.ok) throw new Error('Gagal mengambil data faktur');
      
      const data = await response.json();
      
      // Debug log to verify response structure
      console.log('API Response:', data);
      
      // Handle different response formats
      if (data.fakturs) {
        setFakturs(data.fakturs);
        setTotalItems(data.total || data.fakturs.length);
      } else if (Array.isArray(data)) {
        // If API returns array directly
        setFakturs(data);
        setTotalItems(data.length);
      } else {
        setFakturs([]);
        setTotalItems(0);
      }
      
              setTotalPages(Math.ceil((data.total || totalItems) / itemsPerPage));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedFakturs([]);
    } else {
      const filtered = getFilteredFakturs();
      setSelectedFakturs(filtered.map(f => f.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (id: string) => {
    if (selectedFakturs.includes(id)) {
      setSelectedFakturs(selectedFakturs.filter(item => item !== id));
      setSelectAll(false);
    } else {
      setSelectedFakturs([...selectedFakturs, id]);
      const filtered = getFilteredFakturs();
      if (selectedFakturs.length + 1 === filtered.length) {
        setSelectAll(true);
      }
    }
  };

  const fetchFakturDetails = async (fakturIds: string[]): Promise<DetailFakturData[]> => {
    try {
      const response = await fetch('/api/faktur/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fakturIds })
      });
      
      if (!response.ok) throw new Error('Gagal mengambil detail faktur');
      
      const data: DetailFakturData[] = await response.json();
      return data;
    } catch (err: any) {
      throw new Error(`Error fetching details: ${err.message}`);
    }
  };

  const handleSingleExport = async (fakturId: string, exportFormat: 'coretax' | 'internal' = 'coretax') => {
    try {
      setIsExporting(true);
      setError(null);
      
      // Get detailed faktur data
      const fakturResponse = await fetch(`/api/faktur/${fakturId}`);
      if (!fakturResponse.ok) throw new Error('Gagal mengambil data faktur');
      const fakturData: FakturData & { id: string } = await fakturResponse.json();
      
      // Get faktur details
      const detailsResponse = await fetch(`/api/faktur/${fakturId}/details`);
      if (!detailsResponse.ok) throw new Error('Gagal mengambil detail faktur');
      const detailsData: DetailFakturData[] = await detailsResponse.json();
      
      // Generate Excel file based on selected format
      if (exportFormat === 'coretax') {
        generateExcelFile([fakturData], detailsData);
      } else {
        generateInternalRecapExcelFile([fakturData], detailsData);
      }
      
      // Mark as exported only if we're using the Coretax format
      if (exportFormat === 'coretax') {
        await fetch('/api/faktur/mark-exported', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fakturIds: [fakturId] })
        });
      }
      
      // Show success message
      setSuccessMessage(`Faktur ${fakturData.referensi || fakturId} berhasil diexport`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refresh data if we marked it as exported
      if (exportFormat === 'coretax') {
        fetchFakturs();
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
      setActionMenuOpen(null);
    }
  };

  const handleMultipleExport = async () => {
    if (selectedFakturs.length === 0) {
      setError('Pilih setidaknya satu faktur untuk diexport');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      
      // Fetch detailed data for selected fakturs
      const response = await fetch('/api/faktur/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fakturIds: selectedFakturs })
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data untuk export');
      
      const data = await response.json();
      
      // Get details for all selected fakturs
      const detailsData = await fetchFakturDetails(selectedFakturs);
      
      // Ensure proper type for Excel generation
      const faktursForExport: (FakturData & { id: string })[] = data.fakturs;
      
      // Generate Excel based on selected format
      if (exportType === 'coretax') {
        generateExcelFile(faktursForExport, detailsData);
        
        // Mark fakturs as exported only for Coretax format
        await fetch('/api/faktur/mark-exported', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fakturIds: selectedFakturs })
        });
      } else {
        generateInternalRecapExcelFile(faktursForExport, detailsData);
      }
      
      // Show success message
      setSuccessMessage(`${selectedFakturs.length} faktur berhasil diexport dalam format ${exportType === 'coretax' ? 'Coretax DJP' : 'Rekap Internal'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset selection and refresh data if needed
      setSelectedFakturs([]);
      setSelectAll(false);
      
      // Only refresh data if we've marked faktur as exported (Coretax format)
      if (exportType === 'coretax') {
        fetchFakturs();
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
      setExportDropdownOpen(false);
    }
  };

  const applyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when filtering - like in faktur page
    setCurrentPage(1);
  };

  const resetFilter = () => {
    setFilter({
      status: '',
      synced: '',
      searchQuery: '',
      startDate: '',
      endDate: ''
    });
    setSelectedFakturs([]);
    setSelectAll(false);
    setCurrentPage(1); // Reset page when clearing filters - like in faktur page
  };

  // Since we're now using pagination from the API, we don't need to filter locally
  // This function will only be used for the checkboxes functionality
  const getFilteredFakturs = () => {
    return fakturs;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CREATED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AMENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const toggleActionMenu = (fakturId: string) => {
    if (actionMenuOpen === fakturId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(fakturId);
    }
  };

  const handleExportTypeSelect = (type: 'coretax' | 'internal') => {
    setExportType(type);
    setExportDropdownOpen(false);
  };

  if (isLoading && fakturs.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data faktur...</p>
        </div>
      </div>
    );
  }

  const filteredFakturs = getFilteredFakturs();

  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Export Faktur</h1>
          {selectedCompany?.company_name ? (
            <p className="text-sm text-gray-500">
              Menampilkan faktur untuk perusahaan <span className="font-medium">{selectedCompany.company_name}</span> dengan NPWP <span className="font-mono">{selectedCompany.npwp_company}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">Pilih faktur yang akan diexport dalam format Coretax DJP atau Rekap Internal</p>
          )}
        </div>
        <Link href="/dashboard" className="mt-3 sm:mt-0 flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex bg-red-50 rounded-md p-1 text-red-600 hover:bg-red-100 focus:outline-none"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex bg-green-50 rounded-md p-1 text-green-600 hover:bg-green-100 focus:outline-none"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Search & Filter Toggle */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64 mb-3 sm:mb-0">
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            placeholder="Cari faktur..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          {filter.searchQuery && (
            <button
              onClick={() => setFilter({ ...filter, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          {isFilterExpanded ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </button>
      </div>
      
      {/* Filter Section */}
      {isFilterExpanded && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filter Faktur</h2>
          <form onSubmit={applyFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status Faktur
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="CREATED">CREATED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="AMENDED">AMENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status Sinkronisasi
              </label>
              <select
                value={filter.synced}
                onChange={(e) => setFilter({ ...filter, synced: e.target.value })}
                className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua</option>
                <option value="yes">Sudah Sinkron</option>
                <option value="no">Belum Sinkron</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tanggal Faktur Mulai
              </label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tanggal Faktur Akhir
              </label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                min={filter.startDate}
                className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end col-span-1 sm:col-span-4 space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Terapkan Filter
              </button>
              <button
                type="button"
                onClick={resetFilter}
                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors flex items-center"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {selectedFakturs.length > 0 ? (
                  <>
                    <span className="font-medium">{selectedFakturs.length}</span>
                    <span className="text-gray-500"> dari {filteredFakturs.length} faktur dipilih</span>
                  </>
                ) : (
                  <span>Pilih Semua</span>
                )}
              </span>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Items per page selector */}
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="h-full py-1.5 pl-3 pr-8 border border-gray-300 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <button
              onClick={fetchFakturs}
              className="px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="relative">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => selectedFakturs.length > 0 && handleMultipleExport()}
                  disabled={selectedFakturs.length === 0 || isExporting}
                  className={`px-4 py-2 rounded-md flex items-center justify-center w-full sm:w-auto ${selectedFakturs.length === 0 || isExporting
                      ? 'bg-green-300 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      <span>Mengexport...</span>
                    </>
                  ) : (
                    <>
                      {exportType === 'coretax' ? (
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      <span>Export {exportType === 'coretax' ? 'Coretax' : 'Rekap'} ({selectedFakturs.length})</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="px-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={selectedFakturs.length === 0 || isExporting}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              {exportDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleExportTypeSelect('coretax')}
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${exportType === 'coretax' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-gray-500" />
                      Format Coretax DJP
                    </button>
                    <button
                      onClick={() => handleExportTypeSelect('internal')}
                      className={`flex items-center w-full text-left px-4 py-2 text-sm ${exportType === 'internal' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      Format Rekap Internal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fakturs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-700">
            {fakturs.length} Faktur Tersedia
          </h2>
          {isLoading && fakturs.length > 0 && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-500">Memperbarui data...</span>
            </div>
          )}
        </div>
        
        {fakturs.length === 0 ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <FileSpreadsheet className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-2">Tidak ada faktur yang memenuhi kriteria filter.</p>
            <button
              onClick={resetFilter}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referensi
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembeli
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPWP
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Faktur
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coretax
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFakturs.map((item) => (
                  <tr key={item.id} className={`transition-colors hover:bg-gray-50 ${selectedFakturs.includes(item.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFakturs.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{item.referensi}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="truncate max-w-xs">{item.nama_pembeli}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">{item.npwp_nik_pembeli}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status_faktur || '')}`}>
                        {item.status_faktur}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {item.nomor_faktur_pajak || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {item.is_uploaded_to_coretax ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Tersinkron
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Belum Sinkron
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2 relative">
                        <Link
                          href={`/faktur/${item.id}`}
                          className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition-colors"
                        >
                          Detail
                        </Link>
                        
                        <div className="relative">
                          <button
                            onClick={() => toggleActionMenu(item.id)}
                            className="inline-flex items-center p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          
                          {actionMenuOpen === item.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  onClick={() => handleSingleExport(item.id, 'coretax')}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                  disabled={isExporting}
                                >
                                  <FileSpreadsheet className="h-4 w-4 mr-2 text-gray-500" />
                                  Export Coretax
                                </button>
                                <button
                                  onClick={() => handleSingleExport(item.id, 'internal')}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                  disabled={isExporting}
                                >
                                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  Export Rekap Internal
                                </button>
                                <Link
                                  href={`/faktur/${item.id}/edit`}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                  </svg>
                                  Edit Faktur
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination - Added from faktur page */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                }`}
              >
                Selanjutnya
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-700">
                  Menampilkan <span className="font-medium">{fakturs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>{' '}
                  hingga{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  dari <span className="font-medium">{totalItems}</span> faktur
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label="First page"
                  >
                    <span className="sr-only">First</span>
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label="Previous page"
                  >
                    <span className="sr-only">Previous</span>
                    &lsaquo;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // For simplicity, show 5 pages centered around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      // Show all pages if total is 5 or less
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // Near the start
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Near the end
                      pageNum = totalPages - 4 + i;
                    } else {
                      // In the middle
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label="Next page"
                  >
                    <span className="sr-only">Next</span>
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label="Last page"
                  >
                    <span className="sr-only">Last</span>
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Export Instructions */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Coretax Export Guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Format Coretax DJP
          </h3>
          <p className="text-xs text-blue-700 mb-2">Format ekspor yang sesuai untuk aplikasi Coretax DJP. Faktur yang diekspor akan ditandai sebagai "sudah diekspor".</p>
          <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
            <li>Pilih faktur yang ingin diexport</li>
            <li>Pilih format "Coretax DJP" dari dropdown</li>
            <li>File Excel berisi worksheet sesuai format yang dibutuhkan DJP</li>
            <li>Upload file Excel ke aplikasi Coretax DJP</li>
          </ol>
        </div>
        
        {/* Internal Recap Guide */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Format Rekap Internal
          </h3>
          <p className="text-xs text-purple-700 mb-2">Format laporan internal dengan rekapitulasi berdasarkan bulan. Faktur yang diekspor tidak akan ditandai sebagai "sudah diekspor".</p>
          <ol className="text-xs text-purple-700 space-y-1 ml-4 list-decimal">
            <li>Pilih faktur yang ingin direkap</li>
            <li>Pilih format "Rekap Internal" dari dropdown</li>
            <li>File Excel berisi dua worksheet: "Rekapan berupa Imporan" dan "Rekapan FP 2025"</li>
            <li>Data dikelompokkan per bulan untuk keperluan pelaporan internal</li>
          </ol>
        </div>
      </div>
    </div>
  );
}