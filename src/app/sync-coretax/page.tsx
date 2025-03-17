// src/app/sync-coretax/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncCoretaxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Mengambil status sinkronisasi saat halaman dimuat
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (!response.ok) throw new Error('Gagal mengambil status sinkronisasi');
      const data = await response.json();
      setSyncStatus(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/sync-coretax', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal sinkronisasi data');
      }

      const result = await response.json();
      setSyncResult(result);
      
      // Refresh status sinkronisasi
      fetchSyncStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sinkronisasi Data Coretax</h1>
      
      {/* Status Sinkronisasi Card */}
      {syncStatus && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Status Sinkronisasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-blue-600">Total Faktur</p>
              <p className="text-2xl font-bold">{syncStatus.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-green-600">Tersinkronisasi</p>
              <p className="text-2xl font-bold">{syncStatus.synced}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-yellow-600">Belum Sinkron</p>
              <p className="text-2xl font-bold">{syncStatus.notSynced}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progres Sinkronisasi</span>
              <span>{syncStatus.syncPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${syncStatus.syncPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Sinkronisasi terakhir: {syncStatus.latestSync ? new Date(syncStatus.latestSync).toLocaleString() : 'Belum ada'}
            </p>
          </div>
          
          {/* Status Counts */}
          {syncStatus.statusCounts && syncStatus.statusCounts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Status Faktur</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {syncStatus.statusCounts.map((item: any, index: number) => (
                  <div key={index} className={`p-2 rounded ${
                    item.status === 'APPROVED' ? 'bg-green-50' :
                    item.status === 'CREATED' ? 'bg-blue-50' :
                    item.status === 'AMENDED' ? 'bg-orange-50' :
                    'bg-red-50'
                  }`}>
                    <p className="text-xs text-gray-600">{item.status}</p>
                    <p className="text-lg font-semibold">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent Activity */}
          {syncStatus.recentActivity && syncStatus.recentActivity.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Aktivitas Terbaru</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No. Faktur</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waktu Sync</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {syncStatus.recentActivity.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.reference}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.tax_invoice_number || '-'}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.tax_invoice_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            item.tax_invoice_status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                            item.tax_invoice_status === 'AMENDED' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.tax_invoice_status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {new Date(item.sync_date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload File Coretax</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih File Excel Hasil Export Coretax
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: .xlsx, .xls (Excel)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              !file || isUploading
                ? 'bg-blue-300'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Memproses...' : 'Sinkronisasi Data'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* Result Section */}
      {syncResult && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Hasil Sinkronisasi</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Total Data</p>
              <p className="text-2xl font-bold">{syncResult.total}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm text-green-600">Berhasil Sinkron</p>
              <p className="text-2xl font-bold">{syncResult.synced}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm text-yellow-600">Diupdate</p>
              <p className="text-2xl font-bold">{syncResult.updated}</p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm text-red-600">Tidak Ditemukan</p>
              <p className="text-2xl font-bold">{syncResult.notFound}</p>
            </div>
          </div>
          
          {syncResult.details && syncResult.details.length > 0 && (
            <div className="overflow-x-auto">
              <h3 className="text-md font-semibold mb-2">Detail Sinkronisasi</h3>
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referensi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Faktur
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Coretax
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Faktur
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {syncResult.details.slice(0, 100).map((item: any, index: number) => (
                    <tr key={index} className={item.status === 'not_found' ? 'bg-red-50' : ''}>
                      <td className="px-4 py-2 text-sm">{item.reference}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'synced'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status === 'synced' ? 'Tersinkron' : 'Tidak Ditemukan'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.taxInvoiceNumber}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.taxInvoiceStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            item.taxInvoiceStatus === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                            item.taxInvoiceStatus === 'AMENDED' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.taxInvoiceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {item.fakturId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {syncResult.details.length > 100 && (
                <p className="text-sm text-gray-500 mt-2">
                  Menampilkan 100 dari {syncResult.details.length} data
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}