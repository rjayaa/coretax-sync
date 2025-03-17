// src/app/faktur/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';

type FakturData = {
  id: string;
  referensi: string;
  tanggal_faktur: string;
  nama_pembeli: string;
  npwp_nik_pembeli: string;
  status_faktur: string;
  nomor_faktur_pajak: string | null;
  is_uploaded_to_coretax: boolean;
};

export default function FakturPage() {
  const [fakturs, setFakturs] = useState<FakturData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    synced: '',
    searchQuery: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchFakturs();
  }, [currentPage, filter]);

  const fetchFakturs = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (filter.status) params.append('status', filter.status);
      if (filter.synced) params.append('synced', filter.synced);
      if (filter.searchQuery) params.append('search', filter.searchQuery);
      
      const response = await fetch(`/api/faktur?${params.toString()}`);
      
      if (!response.ok) throw new Error('Gagal mengambil data faktur');
      
      const data = await response.json();
      setFakturs(data.fakturs);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
  };

  const resetFilter = () => {
    setFilter({
      status: '',
      synced: '',
      searchQuery: ''
    });
    setCurrentPage(1);
  };

  if (isLoading && fakturs.length === 0) {
    return <Loading />;
  }

  if (error && fakturs.length === 0) {
    return <ErrorDisplay message={error} onRetry={fetchFakturs} />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Daftar Faktur</h1>
          <p className="text-gray-500">Kelola seluruh faktur pajak</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/faktur/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Buat Faktur Baru
          </Link>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-700 font-medium mt-2 text-sm"
          >
            Tutup
          </button>
        </div>
      )}
      
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Faktur</h2>
        <form onSubmit={applyFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Faktur
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua Status</option>
              <option value="CREATED">CREATED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="AMENDED">AMENDED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Sinkronisasi
            </label>
            <select
              value={filter.synced}
              onChange={(e) => setFilter({...filter, synced: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Semua</option>
              <option value="yes">Sudah Sinkron</option>
              <option value="no">Belum Sinkron</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pencarian
            </label>
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter({...filter, searchQuery: e.target.value})}
              placeholder="Referensi, nama pembeli, NPWP"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {/* Fakturs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {fakturs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Tidak ada faktur yang memenuhi kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Referensi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pembeli
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NPWP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. Faktur Pajak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Coretax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fakturs.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.referensi}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.nama_pembeli}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.npwp_nik_pembeli}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status_faktur === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        item.status_faktur === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                        item.status_faktur === 'AMENDED' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status_faktur}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.nomor_faktur_pajak || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.is_uploaded_to_coretax ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tersinkron
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Belum Sinkron
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      <Link href={`/faktur/${item.id}`}>Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                Selanjutnya
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>{' '}
                  hingga{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, fakturs.length)}
                  </span>{' '}
                  dari <span className="font-medium">{fakturs.length}</span> faktur
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-2 rounded-l-md border border-gray-300 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-2 border border-gray-300 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &lsaquo;
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // For simplicity, show 5 pages centered around current page
                    const pageNum = Math.min(
                      Math.max(currentPage - 2 + i, 1),
                      totalPages
                    );
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 border border-gray-300 ${
                          currentPage === pageNum
                            ? 'bg-blue-50 text-blue-600 border-blue-500 z-10'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-2 border border-gray-300 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-2 rounded-r-md border border-gray-300 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}