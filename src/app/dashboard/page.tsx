
// src/app/dashboard/page.tsx
'use client';
import Loading from '@/components/Loading';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type SyncStatusData = {
  total: number;
  synced: number;
  notSynced: number;
  syncPercentage: number;
  latestSync: string | null;
  statusCounts: Array<{ status: string; count: number }>;
  syncStatus: { synced: number; notSynced: number };
  recentActivity: Array<{
    record_id: string;
    reference: string;
    tax_invoice_number: string;
    tax_invoice_status: string;
    sync_date: string;
  }>;
};

type RecentFakturData = {
  id: string;
  referensi: string;
  tanggal_faktur: string;
  nama_pembeli: string;
  status_faktur: string;
  nomor_faktur_pajak: string | null;
  is_uploaded_to_coretax: boolean;
};

export default function DashboardPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusData | null>(null);
  const [recentFakturs, setRecentFakturs] = useState<RecentFakturData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch sync status
        const statusResponse = await fetch('/api/sync-status');
        if (!statusResponse.ok) throw new Error('Gagal mengambil status sinkronisasi');
        const statusData = await statusResponse.json();
        setSyncStatus(statusData);
        
        // Fetch recent fakturs
        const faktursResponse = await fetch('/api/faktur/recent');
        if (faktursResponse.ok) {
          const faktursData = await faktursResponse.json();
          setRecentFakturs(faktursData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-700">Error</h2>
          </div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Get status color function
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'AMENDED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-600';
      case 'CREATED': return 'bg-blue-600';
      case 'AMENDED': return 'bg-orange-500';
      default: return 'bg-red-600';
    }
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          
          {syncStatus?.latestSync && (
            <div className="text-sm text-gray-500 mt-2 sm:mt-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Terakhir sinkron: {new Date(syncStatus.latestSync).toLocaleString('id-ID')}
            </div>
          )}
        </div>
        
        <div className="bg-blue-600 bg-opacity-10 border border-blue-200 rounded-lg p-4 text-blue-800">
          <p className="text-sm">
            <span className="font-medium">Selamat datang di dashboard Coretax Sync!</span> Pantau status sinkronisasi faktur pajak Anda dengan DJP dan kelola dokumen perpajakan dengan mudah.
          </p>
        </div>
      </header>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/faktur/create" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:bg-blue-50 hover:border-blue-200 transition-all hover:shadow-md group">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2.5 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-700">Buat Faktur</h3>
                  <p className="text-xs text-gray-500">Buat faktur pajak baru</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/sync-coretax" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:bg-green-50 hover:border-green-200 transition-all hover:shadow-md group">
              <div className="flex items-center">
                <div className="bg-green-100 p-2.5 rounded-full mr-3 group-hover:bg-green-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-green-700">Sinkronisasi</h3>
                  <p className="text-xs text-gray-500">Update data dari Coretax</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/export" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:bg-purple-50 hover:border-purple-200 transition-all hover:shadow-md group">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2.5 rounded-full mr-3 group-hover:bg-purple-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 group-hover:text-purple-700">Export Data</h3>
                  <p className="text-xs text-gray-500">Export data untuk Coretax</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Quick Stats */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Total Faktur</h2>
            <div className="flex items-center">
              <div className="bg-blue-100 p-2.5 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{syncStatus.total}</p>
                <p className="text-xs text-gray-500">Total faktur dalam sistem</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Tersinkronisasi</h2>
            <div className="flex items-center">
              <div className="bg-green-100 p-2.5 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{syncStatus.synced}</p>
                <p className="text-xs text-gray-500">Tersinkron dengan Coretax</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Belum Sinkron</h2>
            <div className="flex items-center">
              <div className="bg-amber-100 p-2.5 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{syncStatus.notSynced}</p>
                <p className="text-xs text-gray-500">Belum tersinkron</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Progress Sinkronisasi</h2>
            <div className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-xl font-bold text-gray-800">{syncStatus.syncPercentage}%</span>
                <span className="text-xs text-gray-500">
                  {syncStatus.synced} / {syncStatus.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${syncStatus.syncPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncStatus.latestSync 
                  ? new Date(syncStatus.latestSync).toLocaleString('id-ID')
                  : 'Belum ada'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Breakdown */}
        {syncStatus && syncStatus.statusCounts && syncStatus.statusCounts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-100 mb-3">Status Faktur</h2>
            <div className="space-y-4">
              {syncStatus.statusCounts.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${getStatusBgColor(item.status)}`}></span>
                      {item.status}
                    </span>
                    <span className="font-semibold text-gray-800">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getStatusBgColor(item.status)}`}
                      style={{ width: `${syncStatus.total > 0 ? (item.count / syncStatus.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">
                    {syncStatus.total > 0 ? ((item.count / syncStatus.total) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        {syncStatus && syncStatus.recentActivity && syncStatus.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
              <h2 className="text-base font-semibold text-gray-800">Aktivitas Sinkronisasi</h2>
              <Link href="/sync-coretax" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
                Sinkronisasi
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referensi</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {syncStatus.recentActivity.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          <div className="font-medium">{item.reference}</div>
                          <div className="text-xs text-gray-500">
                            {item.tax_invoice_number || '(Belum Ada No. Faktur)'}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.tax_invoice_status)}`}>
                            {item.tax_invoice_status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
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
      </div>
      
      {/* Recent Fakturs */}
      {recentFakturs && recentFakturs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
            <h2 className="text-base font-semibold text-gray-800">Faktur Terbaru</h2>
            <Link href="/faktur" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referensi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembeli</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Faktur</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coretax</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFakturs.slice(0, 5).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{item.referensi}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">{item.nama_pembeli}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status_faktur)}`}>
                        {item.status_faktur}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {item.nomor_faktur_pajak || '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {item.is_uploaded_to_coretax ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Tersinkron
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-center">
                      <Link href={`/faktur/${item.id}`}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          Detail
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentFakturs.length > 5 && (
            <div className="mt-3 text-center">
              <Link href="/faktur" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Lihat {recentFakturs.length - 5} faktur lainnya
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}