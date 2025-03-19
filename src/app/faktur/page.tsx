'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';
import { 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  ArrowLeftIcon, 
  RefreshCwIcon,
  ChevronDown,
  ArrowUpDown,
  Trash2,
  Pencil,
  CalendarIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { formatDate, formatCurrency, getMonth, getYear } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Custom event name for company change - must match the one in Sidebar
const COMPANY_CHANGE_EVENT = 'company-changed';

// Constants
const STATUS_OPTIONS = ['APPROVED', 'CREATED', 'AMENDED', 'CANCELLED'];

type FakturData = {
  id: string;
  referensi: string;
  tanggal_faktur: string;
  nama_pembeli: string;
  npwp_nik_pembeli: string;
  status_faktur: string;
  nomor_faktur_pajak: string | null;
  is_uploaded_to_coretax: boolean;
  kode_transaksi: string;
  // Add additional fields from DetailFakturData that we might need
  details?: Array<{
    dpp: string;
    ppn: string;
    dpp_nilai_lain: string;
    ppnbm: string;
  }>;
};

interface SelectedCompany {
  company_name?: string;
  company_code?: string;
  npwp_company?: string;
}

type SortDirection = 'asc' | 'desc' | null;

// Component for text filter
const TextFilter = ({ 
  value, 
  onChange, 
  onClear, 
  placeholder 
}: { 
  value: string, 
  onChange: (value: string) => void,
  onClear: () => void,
  placeholder?: string
}) => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Filter..."}
        className="w-full py-1.5 pl-8 pr-8 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <SearchIcon className="h-3.5 w-3.5 text-gray-400" />
      </div>
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// Component for date filter
const DateFilter = ({ 
  value, 
  onChange, 
  onClear 
}: { 
  value: string, 
  onChange: (value: string) => void,
  onClear: () => void
}) => {
  return (
    <div className="relative w-full">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-1.5 pl-8 pr-8 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
      </div>
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// Component for month filter
const MonthFilter = ({ 
  value, 
  onChange, 
  onClear 
}: { 
  value: number | null, 
  onChange: (value: number | null) => void,
  onClear: () => void
}) => {
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

  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-1.5 px-3 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {value ? months.find(m => m.value === value)?.label : "Pilih Bulan"}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      
      {value !== null && (
        <button
          onClick={() => {
            onClear();
            setIsOpen(false);
          }}
          className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {months.map((month) => (
            <button
              key={month.value}
              className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                value === month.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => {
                onChange(month.value);
                setIsOpen(false);
              }}
            >
              {month.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for year filter
const YearFilter = ({ 
  value, 
  onChange, 
  onClear 
}: { 
  value: number | null, 
  onChange: (value: number | null) => void,
  onClear: () => void
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-1.5 px-3 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {value ? value.toString() : "Pilih Tahun"}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      
      {value !== null && (
        <button
          onClick={() => {
            onClear();
            setIsOpen(false);
          }}
          className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {years.map((year) => (
            <button
              key={year}
              className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                value === year ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => {
                onChange(year);
                setIsOpen(false);
              }}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch(status) {
    case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CREATED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'AMENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-red-100 text-red-800 border-red-200';
  }
};

// Component for status filter
const StatusFilter = ({ 
  value, 
  onChange, 
  onClear 
}: { 
  value: string | null, 
  onChange: (value: string | null) => void,
  onClear: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-1.5 px-3 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {value || "Pilih Status"}
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      
      {value !== null && (
        <button
          onClick={() => {
            onClear();
            setIsOpen(false);
          }}
          className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                value === status ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => {
                onChange(status);
                setIsOpen(false);
              }}
            >
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FakturPage() {
  const [fakturs, setFakturs] = useState<FakturData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Column filters
  const [npwpFilter, setNpwpFilter] = useState('');
  const [namaFilter, setNamaFilter] = useState('');
  const [kodeTransaksiFilter, setKodeTransaksiFilter] = useState('');
  const [nomorFakturFilter, setNomorFakturFilter] = useState('');
  const [referensiFilter, setReferensiFilter] = useState('');
  const [tanggalFilter, setTanggalFilter] = useState('');
  const [bulanFilter, setBulanFilter] = useState<number | null>(null);
  const [tahunFilter, setTahunFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [coretaxFilter, setCoretaxFilter] = useState<string | null>(null);

  // Sorting states
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Load selected company from localStorage and setup event listener
  useEffect(() => {
    const savedCompanyStr = localStorage.getItem('selectedCompany');
    if (savedCompanyStr) {
      try {
        const company = JSON.parse(savedCompanyStr);
        setSelectedCompany(company);
      } catch (err) {
        console.error('Error parsing selected company:', err);
      }
    }

    // Listen for company change events
    const handleCompanyChange = (event: any) => {
      console.log('Company changed event received:', event.detail);
      setSelectedCompany(event.detail.company);
      // Reset to page 1 when company changes
      setCurrentPage(1);
    };

    // Add event listener for company changes
    window.addEventListener(COMPANY_CHANGE_EVENT, handleCompanyChange);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener(COMPANY_CHANGE_EVENT, handleCompanyChange);
    };
  }, []);

  useEffect(() => {
    fetchFakturs();
  }, [currentPage, 
      npwpFilter, namaFilter, kodeTransaksiFilter, nomorFakturFilter, referensiFilter,
      tanggalFilter, bulanFilter, tahunFilter, statusFilter, coretaxFilter,
      selectedCompany, itemsPerPage
  ]);

  const fetchFakturs = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Add status filter (already works)
      if (statusFilter) params.append('status', statusFilter);
      
      // Add synced filter (already works)
      if (coretaxFilter) params.append('synced', coretaxFilter);
      
      // Add individual search parameters - try with individual search terms
      if (npwpFilter) params.append('search', npwpFilter);
      if (namaFilter) params.append('search', namaFilter);
      if (kodeTransaksiFilter) params.append('search', kodeTransaksiFilter);
      if (nomorFakturFilter) params.append('search', nomorFakturFilter);
      if (referensiFilter) params.append('search', referensiFilter);
      
      // Handle date filters
      if (tanggalFilter) {
        // Format as date range for a single day
        params.append('tanggalMulai', tanggalFilter);
        params.append('tanggalAkhir', tanggalFilter);
        params.append('startDate', tanggalFilter);
        params.append('endDate', tanggalFilter);
      } else {
        // Handle month and year filters by converting to date ranges
        if (bulanFilter !== null || tahunFilter !== null) {
          const year = tahunFilter || new Date().getFullYear();
          const month = bulanFilter !== null ? bulanFilter - 1 : 0; // JavaScript months are 0-based
          
          if (bulanFilter !== null) {
            // If month is specified, create a range for that month
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0); // Last day of month
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            params.append('tanggalMulai', startDateStr);
            params.append('tanggalAkhir', endDateStr);
            params.append('startDate', startDateStr);
            params.append('endDate', endDateStr);
          } else {
            // If only year is specified, create a range for the whole year
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            params.append('tanggalMulai', startDateStr);
            params.append('tanggalAkhir', endDateStr);
            params.append('startDate', startDateStr);
            params.append('endDate', endDateStr);
          }
        }
      }
      
      // Add company filter
      if (selectedCompany?.npwp_company) {
        params.append('npwp_penjual', selectedCompany.npwp_company);
        console.log('Filtering by NPWP:', selectedCompany.npwp_company);
      }
      
      // Debug
      console.log('Fetching fakturs with params:', Object.fromEntries(params.entries()));
      
      const response = await fetch(`/api/faktur?${params.toString()}`);
      
      if (!response.ok) throw new Error('Gagal mengambil data faktur');
      
      const data = await response.json();
      
      // Fetch details for each faktur
      let faktursWithDetails = [];
      if (data.fakturs && Array.isArray(data.fakturs)) {
        // Get details for all fakturs in one batch if possible
        const fakturIds = data.fakturs.map((f: FakturData) => f.id);
        try {
          const detailsResponse = await fetch('/api/faktur/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fakturIds })
          });
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            
            // Group details by id_faktur
            const detailsByFakturId: Record<string, any[]> = {};
            detailsData.forEach((detail: any) => {
              const fakturId = detail.id_faktur;
              if (!fakturId) {
                console.warn('Detail record missing id_faktur:', detail);
                return;
              }
              
              if (!detailsByFakturId[fakturId]) {
                detailsByFakturId[fakturId] = [];
              }
              detailsByFakturId[fakturId].push(detail);
            });
            
            // Merge fakturs with their details
            faktursWithDetails = data.fakturs.map((faktur: FakturData) => {
              const details = detailsByFakturId[faktur.id] || [];
              return {
                ...faktur,
                details
              };
            });
          } else {
            // If bulk fetch fails, continue with fakturs without details
            faktursWithDetails = data.fakturs;
            console.warn('Failed to fetch faktur details in bulk');
          }
        } catch (detailsErr) {
          console.error('Error fetching details:', detailsErr);
          faktursWithDetails = data.fakturs;
        }
      }
      
      setFakturs(faktursWithDetails);
      setTotalItems(data.pagination?.total || data.total || data.fakturs.length);
      setTotalPages(Math.ceil(data.pagination?.total / itemsPerPage) || Math.ceil(data.total / itemsPerPage) || 1);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching faktur data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setNpwpFilter('');
    setNamaFilter('');
    setKodeTransaksiFilter('');
    setNomorFakturFilter('');
    setReferensiFilter('');
    setTanggalFilter('');
    setBulanFilter(null);
    setTahunFilter(null);
    setStatusFilter(null);
    setCoretaxFilter(null);
    setSortField(null);
    setSortDirection(null);
    setCurrentPage(1);
  };

  // This is a duplicate of getStatusColor defined at the top of the file
  // Removing it to avoid confusion

  // Function to handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // New field, set to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/faktur/${id}`;
  };

  const handleDelete = async (id: string) => {
    // This would be implemented based on your API for deletion
    try {
      const response = await fetch(`/api/faktur/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Gagal menghapus faktur');
      
      // Refetch data after deletion
      fetchFakturs();
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting faktur:', err);
      return false;
    } finally {
      setShowDeleteModal(null);
    }
  };

  // Calculate totals from faktur details
  const calculateTotalDPP = (details?: any[]) => {
    if (!details || details.length === 0) return 0;
    return details.reduce((sum, detail) => {
      const dpp = parseFloat(detail.dpp || '0');
      return sum + (isNaN(dpp) ? 0 : dpp);
    }, 0);
  };

  const calculateTotalPPN = (details?: any[]) => {
    if (!details || details.length === 0) return 0;
    return details.reduce((sum, detail) => {
      const ppn = parseFloat(detail.ppn || '0');
      return sum + (isNaN(ppn) ? 0 : ppn);
    }, 0);
  };

  const calculateTotalDPPNilaiLain = (details?: any[]) => {
    if (!details || details.length === 0) return 0;
    return details.reduce((sum, detail) => {
      const dppNilaiLain = parseFloat(detail.dpp_nilai_lain || '0');
      return sum + (isNaN(dppNilaiLain) ? 0 : dppNilaiLain);
    }, 0);
  };

  const calculateTotalPPNBM = (details?: any[]) => {
    if (!details || details.length === 0) return 0;
    return details.reduce((sum, detail) => {
      const ppnbm = parseFloat(detail.ppnbm || '0');
      return sum + (isNaN(ppnbm) ? 0 : ppnbm);
    }, 0);
  };

  // Sort the faktur data
  const sortedFakturs = useMemo(() => {
    if (!sortField || !sortDirection) return fakturs;

    return [...fakturs].sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case 'referensi':
          valueA = a.referensi || '';
          valueB = b.referensi || '';
          break;
        case 'tanggal_faktur':
          valueA = new Date(a.tanggal_faktur || '').getTime();
          valueB = new Date(b.tanggal_faktur || '').getTime();
          break;
        case 'nama_pembeli':
          valueA = a.nama_pembeli || '';
          valueB = b.nama_pembeli || '';
          break;
        case 'npwp_nik_pembeli':
          valueA = a.npwp_nik_pembeli || '';
          valueB = b.npwp_nik_pembeli || '';
          break;
        case 'status_faktur':
          valueA = a.status_faktur || '';
          valueB = b.status_faktur || '';
          break;
        case 'nomor_faktur_pajak':
          valueA = a.nomor_faktur_pajak || '';
          valueB = b.nomor_faktur_pajak || '';
          break;
        case 'dpp':
          valueA = calculateTotalDPP(a.details);
          valueB = calculateTotalDPP(b.details);
          break;
        case 'ppn':
          valueA = calculateTotalPPN(a.details);
          valueB = calculateTotalPPN(b.details);
          break;
        case 'dpp_nilai_lain':
          valueA = calculateTotalDPPNilaiLain(a.details);
          valueB = calculateTotalDPPNilaiLain(b.details);
          break;
        case 'ppnbm':
          valueA = calculateTotalPPNBM(a.details);
          valueB = calculateTotalPPNBM(b.details);
          break;
        default:
          return 0;
      }

      // Handle string vs number comparisons
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        // For numbers, dates, etc.
        return sortDirection === 'asc' 
          ? (valueA > valueB ? 1 : -1) 
          : (valueB > valueA ? 1 : -1);
      }
    });
  }, [fakturs, sortField, sortDirection]);

  // Check if any filter is active
  const isAnyFilterActive = 
    npwpFilter || namaFilter || kodeTransaksiFilter || nomorFakturFilter || 
    referensiFilter || tanggalFilter || bulanFilter !== null || 
    tahunFilter !== null || statusFilter !== null || coretaxFilter !== null ||
    sortField !== null;

  if (isLoading && fakturs.length === 0) {
    return <Loading />;
  }

  if (error && fakturs.length === 0) {
    return <ErrorDisplay message={error} onRetry={fetchFakturs} />;
  }

  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Daftar Faktur</h1>
          {selectedCompany?.company_name ? (
            <p className="text-sm text-gray-500">
              Menampilkan faktur untuk <span className="font-medium">{selectedCompany.company_name}</span> dengan NPWP <span className="font-mono">{selectedCompany.npwp_company}</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">Kelola seluruh faktur pajak</p>
          )}
        </div>
        <div className="flex mt-3 sm:mt-0 space-x-3">
          <Link 
            href="/faktur/create" 
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Buat Faktur
          </Link>
          <Link 
            href="/dashboard" 
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
            Dashboard
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
      
      {/* Fakturs Table with Items Per Page selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
            {isAnyFilterActive 
              ? `Menampilkan ${sortedFakturs.length} dari ${totalItems} faktur` 
              : `Total ${totalItems} faktur`}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {isAnyFilterActive && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-100 transition-colors flex items-center w-full sm:w-auto justify-center"
              >
                <RefreshCwIcon className="h-3.5 w-3.5 mr-1.5" />
                Reset Filter
              </button>
            )}
            <div className="flex items-center">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="p-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
              </select>
            </div>
            {isLoading && fakturs.length > 0 && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                <span className="text-sm text-gray-500">Memperbarui data...</span>
              </div>
            )}
          </div>
        </div>
        
        {sortedFakturs.length === 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('referensi')}>
                      <div className="flex items-center">
                        Referensi
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'referensi' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={referensiFilter}
                        onChange={setReferensiFilter}
                        onClear={() => setReferensiFilter('')}
                        placeholder="Filter referensi..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('tanggal_faktur')}>
                      <div className="flex items-center">
                        Tanggal
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'tanggal_faktur' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <DateFilter
                        value={tanggalFilter}
                        onChange={setTanggalFilter}
                        onClear={() => setTanggalFilter('')}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bulan / Tahun
                    </div>
                    <div className="mt-1 flex space-x-1">
                      <div className="w-1/2">
                        <MonthFilter
                          value={bulanFilter}
                          onChange={setBulanFilter}
                          onClear={() => setBulanFilter(null)}
                        />
                      </div>
                      <div className="w-1/2">
                        <YearFilter
                          value={tahunFilter}
                          onChange={setTahunFilter}
                          onClear={() => setTahunFilter(null)}
                        />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('nama_pembeli')}>
                      <div className="flex items-center">
                        Pembeli
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'nama_pembeli' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={namaFilter}
                        onChange={setNamaFilter}
                        onClear={() => setNamaFilter('')}
                        placeholder="Filter pembeli..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('npwp_nik_pembeli')}>
                      <div className="flex items-center">
                        NPWP
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'npwp_nik_pembeli' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={npwpFilter}
                        onChange={setNpwpFilter}
                        onClear={() => setNpwpFilter('')}
                        placeholder="Filter NPWP..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('kode_transaksi')}>
                      <div className="flex items-center">
                        Kode Transaksi
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'kode_transaksi' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={kodeTransaksiFilter}
                        onChange={setKodeTransaksiFilter}
                        onClear={() => setKodeTransaksiFilter('')}
                        placeholder="Filter kode..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status_faktur')}>
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'status_faktur' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <StatusFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        onClear={() => setStatusFilter(null)}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('nomor_faktur_pajak')}>
                      <div className="flex items-center">
                        No. Faktur
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'nomor_faktur_pajak' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={nomorFakturFilter}
                        onChange={setNomorFakturFilter}
                        onClear={() => setNomorFakturFilter('')}
                        placeholder="Filter nomor..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('dpp')}>
                      <div className="flex items-center">
                        DPP
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'dpp' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('ppn')}>
                      <div className="flex items-center">
                        PPN
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'ppn' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('dpp_nilai_lain')}>
                      <div className="flex items-center">
                        DPP Nilai Lain
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'dpp_nilai_lain' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('ppnbm')}>
                      <div className="flex items-center">
                        PPNBM
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'ppnbm' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coretax
                    </div>
                    <div className="mt-1">
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setCoretaxFilter(coretaxFilter === 'yes' ? 'no' : coretaxFilter === 'no' ? null : 'yes')}
                          className="w-full flex justify-between items-center py-1.5 px-3 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {coretaxFilter === 'yes' ? 'Sudah Sinkron' : 
                           coretaxFilter === 'no' ? 'Belum Sinkron' : 'Semua'}
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        
                        {coretaxFilter !== null && (
                          <button
                            onClick={() => setCoretaxFilter(null)}
                            className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-500 text-sm">
                    <p>Tidak ada faktur yang memenuhi kriteria filter.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('referensi')}>
                      <div className="flex items-center">
                        Referensi
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'referensi' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={referensiFilter}
                        onChange={setReferensiFilter}
                        onClear={() => setReferensiFilter('')}
                        placeholder="Filter referensi..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('tanggal_faktur')}>
                      <div className="flex items-center">
                        Tanggal
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'tanggal_faktur' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <DateFilter
                        value={tanggalFilter}
                        onChange={setTanggalFilter}
                        onClear={() => setTanggalFilter('')}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bulan / Tahun
                    </div>
                    <div className="mt-1 flex space-x-1">
                      <div className="w-1/2">
                        <MonthFilter
                          value={bulanFilter}
                          onChange={setBulanFilter}
                          onClear={() => setBulanFilter(null)}
                        />
                      </div>
                      <div className="w-1/2">
                        <YearFilter
                          value={tahunFilter}
                          onChange={setTahunFilter}
                          onClear={() => setTahunFilter(null)}
                        />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('nama_pembeli')}>
                      <div className="flex items-center">
                        Pembeli
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'nama_pembeli' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={namaFilter}
                        onChange={setNamaFilter}
                        onClear={() => setNamaFilter('')}
                        placeholder="Filter pembeli..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('npwp_nik_pembeli')}>
                      <div className="flex items-center">
                        NPWP
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'npwp_nik_pembeli' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={npwpFilter}
                        onChange={setNpwpFilter}
                        onClear={() => setNpwpFilter('')}
                        placeholder="Filter NPWP..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('kode_transaksi')}>
                      <div className="flex items-center">
                        Kode Transaksi
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'kode_transaksi' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={kodeTransaksiFilter}
                        onChange={setKodeTransaksiFilter}
                        onClear={() => setKodeTransaksiFilter('')}
                        placeholder="Filter kode..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status_faktur')}>
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'status_faktur' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <StatusFilter
                        value={statusFilter}
                        onChange={setStatusFilter}
                        onClear={() => setStatusFilter(null)}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('nomor_faktur_pajak')}>
                      <div className="flex items-center">
                        No. Faktur
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'nomor_faktur_pajak' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                    <div className="mt-1">
                      <TextFilter
                        value={nomorFakturFilter}
                        onChange={setNomorFakturFilter}
                        onClear={() => setNomorFakturFilter('')}
                        placeholder="Filter nomor..."
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('dpp')}>
                      <div className="flex items-center">
                        DPP
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'dpp' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('ppn')}>
                      <div className="flex items-center">
                        PPN
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'ppn' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('dpp_nilai_lain')}>
                      <div className="flex items-center">
                        DPP Nilai Lain
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'dpp_nilai_lain' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('ppnbm')}>
                      <div className="flex items-center">
                        PPNBM
                        <ArrowUpDown className={cn(
                          "ml-1 h-3.5 w-3.5", 
                          sortField === 'ppnbm' ? "text-blue-600" : "text-gray-400"
                        )} />
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <div className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coretax
                    </div>
                    <div className="mt-1">
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setCoretaxFilter(coretaxFilter === 'yes' ? 'no' : coretaxFilter === 'no' ? null : 'yes')}
                          className="w-full flex justify-between items-center py-1.5 px-3 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {coretaxFilter === 'yes' ? 'Sudah Sinkron' : 
                           coretaxFilter === 'no' ? 'Belum Sinkron' : 'Semua'}
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        
                        {coretaxFilter !== null && (
                          <button
                            onClick={() => setCoretaxFilter(null)}
                            className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedFakturs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{item.referensi}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(item.tanggal_faktur)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {getMonth(item.tanggal_faktur)} / {getYear(item.tanggal_faktur)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600">
                      <div className="truncate max-w-xs">{item.nama_pembeli}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">{item.npwp_nik_pembeli}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{item.kode_transaksi}</td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status_faktur)}`}>
                        {item.status_faktur}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                      {item.nomor_faktur_pajak || '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                      {formatCurrency(calculateTotalDPP(item.details))}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                      {formatCurrency(calculateTotalPPN(item.details))}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                      {formatCurrency(calculateTotalDPPNilaiLain(item.details))}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                      {formatCurrency(calculateTotalPPNBM(item.details))}
                    </td>
                    <td className="px-3 py-3 text-sm whitespace-nowrap">
                      {item.is_uploaded_to_coretax ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Tersinkron
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit Faktur"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus Faktur"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
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
                  Menampilkan <span className="font-medium">{sortedFakturs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>{' '}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Konfirmasi Hapus Faktur
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDelete(showDeleteModal)}
                >
                  Hapus
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}