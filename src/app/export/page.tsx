// src/app/export/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

type FakturData = {
  id: string;
  referensi: string;
  tanggal_faktur: string;
  nama_pembeli: string;
  npwp_nik_pembeli: string;
  status_faktur: string;
  is_uploaded_to_coretax: boolean;
};

export default function ExportPage() {
  const [fakturs, setFakturs] = useState<FakturData[]>([]);
  const [selectedFakturs, setSelectedFakturs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    synced: '',
    searchQuery: ''
  });

  useEffect(() => {
    fetchFakturs();
  }, []);

  const fetchFakturs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/faktur/not-exported');
      if (!response.ok) throw new Error('Gagal mengambil data faktur');
      const data = await response.json();
      setFakturs(data);
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

  const handleExport = async () => {
    if (selectedFakturs.length === 0) {
      setError('Pilih setidaknya satu faktur untuk diexport');
      return;
    }

    try {
      setIsExporting(true);
      
      // Fetch detail for selected fakturs
      const response = await fetch('/api/faktur/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fakturIds: selectedFakturs })
      });
      
      if (!response.ok) throw new Error('Gagal mengambil data untuk export');
      
      const data = await response.json();
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(data.fakturs);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Faktur Export");
      
      // If there are details, add another sheet
      if (data.details && data.details.length > 0) {
        const detailsWs = XLSX.utils.json_to_sheet(data.details);
        XLSX.utils.book_append_sheet(wb, detailsWs, "Detail Items");
      }
      
      // Create Excel file and trigger download
      XLSX.writeFile(wb, "Export_Coretax_" + new Date().toISOString().split('T')[0] + ".xlsx");
      
      // Update fakturs status
      await fetch('/api/faktur/mark-exported', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fakturIds: selectedFakturs })
      });
      
      // Reset selection and refresh data
      setSelectedFakturs([]);
      setSelectAll(false);
      fetchFakturs();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const applyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are applied via getFilteredFakturs
    // Reset selection when filter changes
    setSelectedFakturs([]);
    setSelectAll(false);
  };

  const resetFilter = () => {
    setFilter({
      status: '',
      synced: '',
      searchQuery: ''
    });
    setSelectedFakturs([]);
    setSelectAll(false);
  };

  const getFilteredFakturs = () => {
    return fakturs.filter(faktur => {
      // Filter by status
      if (filter.status && faktur.status_faktur !== filter.status) {
        return false;
      }
      
      // Filter by sync status
      if (filter.synced === 'yes' && !faktur.is_uploaded_to_coretax) {
        return false;
      }
      if (filter.synced === 'no' && faktur.is_uploaded_to_coretax) {
        return false;
      }
      
      // Filter by search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        return (
          faktur.referensi.toLowerCase().includes(query) ||
          faktur.nama_pembeli.toLowerCase().includes(query) ||
          faktur.npwp_nik_pembeli.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memuat data faktur...</p>
        </div>
      </div>
    );
  }

  const filteredFakturs = getFilteredFakturs();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Export Faktur ke Coretax</h1>
          <p className="text-gray-500">Pilih faktur yang akan diexport ke Coretax</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Kembali ke Dashboard
        </Link>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleSelectAll}
            className="h-5 w-5 text-blue-600 rounded mr-2"
          />
          <span>
            {selectedFakturs.length} dari {filteredFakturs.length} faktur dipilih
          </span>
        </div>
        
        <button
          onClick={handleExport}
          disabled={selectedFakturs.length === 0 || isExporting}
          className={`px-4 py-2 rounded ${
            selectedFakturs.length === 0 || isExporting
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isExporting ? 'Mengexport...' : 'Export Faktur Terpilih'}
        </button>
      </div>
      
      {/* Fakturs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredFakturs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Tidak ada faktur yang memenuhi kriteria filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <span className="sr-only">Select</span>
                  </th>
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
                    Coretax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFakturs.map((item) => (
                  <tr key={item.id} className={selectedFakturs.includes(item.id) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFakturs.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-5 w-5 text-blue-600 rounded"
                      />
                    </td>
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
      </div>
    </div>
  );
}