
// src/app/sync-coretax/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, RefreshCw, Clock, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function SyncCoretaxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  // Add state to track whether to show all items
  const [showAllDetails, setShowAllDetails] = useState(false);
  const router = useRouter();

  // Mengambil status sinkronisasi saat halaman dimuat
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/sync-status');
      if (!response.ok) throw new Error('Gagal mengambil status sinkronisasi');
      const data = await response.json();
      setSyncStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CREATED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AMENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sinkronisasi Data Coretax</h1>
          <p className="text-sm text-gray-500">Sinkronkan data faktur dengan DJP Coretax</p>
        </div>
        <Link href="/dashboard" className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - Status Sinkronisasi */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Sinkronisasi Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-800">Status Sinkronisasi</h2>
              <button 
                onClick={fetchSyncStatus} 
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                disabled={isFetching}
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Memuat...' : 'Refresh'}
              </button>
            </div>
            
            <div className="p-5">
              {isFetching && !syncStatus ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-500">Memuat data sinkronisasi...</p>
                </div>
              ) : syncStatus ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Total Faktur</p>
                      <p className="text-xl lg:text-2xl font-bold text-blue-800">{syncStatus.total}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <p className="text-xs text-green-600 font-medium mb-1">Tersinkronisasi</p>
                      <p className="text-xl lg:text-2xl font-bold text-green-800">{syncStatus.synced}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <p className="text-xs text-amber-600 font-medium mb-1">Belum Sinkron</p>
                      <p className="text-xl lg:text-2xl font-bold text-amber-800">{syncStatus.notSynced}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-700">Progress Sinkronisasi</span>
                      <div className="flex items-center">
                        <span className="font-medium">{syncStatus.syncPercentage}%</span>
                        <span className="text-gray-500 ml-2">({syncStatus.synced}/{syncStatus.total})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${syncStatus.syncPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      Sinkronisasi terakhir: {syncStatus.latestSync ? new Date(syncStatus.latestSync).toLocaleString('id-ID') : 'Belum ada'}
                    </div>
                  </div>
                  
                  {/* Status Counts */}
                  {syncStatus.statusCounts && syncStatus.statusCounts.length > 0 && (
                    <div className="mb-5">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Distribusi Status Faktur</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {syncStatus.statusCounts.map((item: any, index: number) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            item.status === 'APPROVED' ? 'bg-green-50 border-green-100' :
                            item.status === 'CREATED' ? 'bg-blue-50 border-blue-100' :
                            item.status === 'AMENDED' ? 'bg-orange-50 border-orange-100' :
                            'bg-red-50 border-red-100'
                          }`}>
                            <p className="text-xs font-medium mb-1 truncate">
                              {item.status}
                            </p>
                            <div className="flex justify-between items-end">
                              <p className="text-lg font-semibold">{item.count}</p>
                              <p className="text-xs text-gray-500">
                                {syncStatus.total > 0 ? Math.round((item.count / syncStatus.total) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Activity */}
                  {syncStatus.recentActivity && syncStatus.recentActivity.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Aktivitas Sinkronisasi Terbaru</h3>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referensi</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Faktur</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {syncStatus.recentActivity.map((item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{item.reference}</td>
                                  <td className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">{item.tax_invoice_number || '-'}</td>
                                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.tax_invoice_status)}`}>
                                      {item.tax_invoice_status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(item.sync_date).toLocaleString('id-ID')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : error ? (
                <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-red-800 font-medium">Gagal memuat data</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        fetchSyncStatus();
                      }}
                      className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-gray-500">Tidak ada data sinkronisasi tersedia</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Result Section */}
          {syncResult && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-medium text-gray-800">Hasil Sinkronisasi</h2>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">Total Data</p>
                    <p className="text-lg font-bold text-gray-800">{syncResult.total}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Berhasil</p>
                    <p className="text-lg font-bold text-green-800">{syncResult.synced}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Diupdate</p>
                    <p className="text-lg font-bold text-blue-800">{syncResult.updated}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium mb-1">Tidak Ditemukan</p>
                    <p className="text-lg font-bold text-red-800">{syncResult.notFound}</p>
                  </div>
                </div>
                
                {syncResult.details && syncResult.details.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <h3 className="text-sm font-medium text-gray-700">Detail Sinkronisasi</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referensi
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              No. Faktur
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status Coretax
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID Faktur
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Update this line to show all items or just the first 10 based on state */}
                          {(showAllDetails ? syncResult.details : syncResult.details.slice(0, 10)).map((item: any, index: number) => (
                            <tr key={index} className={`hover:bg-gray-50 ${item.status === 'not_found' ? 'bg-red-50' : ''}`}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.reference}</td>
                              <td className="px-4 py-3 text-sm">
                                {item.status === 'synced' ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Tersinkron
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Tidak Ditemukan
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                {item.taxInvoiceNumber || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {item.taxInvoiceStatus && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.taxInvoiceStatus)}`}>
                                    {item.taxInvoiceStatus}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                {item.fakturId || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {syncResult.details.length > 10 && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                          Menampilkan {showAllDetails ? syncResult.details.length : 10} dari {syncResult.details.length} data
                        </p>
                        <button 
                          onClick={() => setShowAllDetails(!showAllDetails)}
                          className="mt-1 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {showAllDetails ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-5">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-medium text-gray-800">Upload File Coretax</h2>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    File Excel Hasil Export Coretax
                  </label>
                  
                  <div className={`border-2 border-dashed rounded-lg ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} transition-colors p-4 text-center`}>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      {file ? (
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-blue-700 mb-1">File dipilih:</p>
                          <p className="text-xs text-blue-600 truncate max-w-full">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <UploadCloud className="h-5 w-5 text-gray-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Klik untuk memilih file</p>
                          <p className="text-xs text-gray-500">atau tarik dan lepas file di sini</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    Format yang didukung: .xlsx, .xls (Excel)
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-colors ${
                    !file || isUploading
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Sinkronisasi Data
                    </>
                  )}
                </button>
              </form>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Terjadi kesalahan:</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-xs font-medium text-red-800 hover:text-red-900"
                  >
                    Tutup
                  </button>
                </div>
              )}
              
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Instruksi Sinkronisasi</h3>
                <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                  <li>Log in ke aplikasi DJP Coretax</li>
                  <li>Export data faktur dalam format Excel</li>
                  <li>Upload file Excel tersebut di sini</li>
                  <li>Sistem akan otomatis memperbarui status faktur</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}