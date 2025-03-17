// src/app/dashboard/page.tsx
'use client';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Faktur & Coretax</h1>
      
      {/* Quick Stats */}
      {syncStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Total Faktur</h2>
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{syncStatus.total}</p>
                <p className="text-sm text-gray-500">Total faktur dalam sistem</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Tersinkronisasi</h2>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{syncStatus.synced}</p>
                <p className="text-sm text-gray-500">Tersinkron dengan Coretax</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Belum Sinkron</h2>
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold">{syncStatus.notSynced}</p>
                <p className="text-sm text-gray-500">Belum tersinkron</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Progress Sinkronisasi</h2>
            <div className="flex flex-col">
              <div className="flex justify-between mb-1">
                <span className="text-base font-semibold">{syncStatus.syncPercentage}%</span>
                <span className="text-sm text-gray-500">
                  {syncStatus.synced} / {syncStatus.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${syncStatus.syncPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Terakhir sinkron: {syncStatus.latestSync 
                  ? new Date(syncStatus.latestSync).toLocaleString('id-ID')
                  : 'Belum ada'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Breakdown */}
        {syncStatus && syncStatus.statusCounts && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Status Faktur</h2>
            <div className="space-y-4">
              {syncStatus.statusCounts.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium">{item.status}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        item.status === 'APPROVED' ? 'bg-green-600' :
                        item.status === 'CREATED' ? 'bg-blue-600' :
                        item.status === 'AMENDED' ? 'bg-orange-500' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${syncStatus.total > 0 ? (item.count / syncStatus.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        {syncStatus && syncStatus.recentActivity && syncStatus.recentActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Aktivitas Sinkronisasi Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syncStatus.recentActivity.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.reference}
                        <div className="text-xs text-gray-500">
                          {item.tax_invoice_number || '(Belum Ada No. Faktur)'}
                        </div>
                      </td>
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
                        {new Date(item.sync_date).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link href="/sync-coretax" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Sinkronisasi Data →
              </Link>
            </div>
          </div>
        )}
      </div>
       {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Link href="/faktur/create" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Buat Faktur</h3>
                <p className="text-sm text-gray-500">Buat faktur pajak baru</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/sync-coretax" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Sinkronisasi Coretax</h3>
                <p className="text-sm text-gray-500">Update data dari Coretax</p>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/export" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Export Data</h3>
                <p className="text-sm text-gray-500">Export data untuk Coretax</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
      {/* Recent Fakturs */}
      {recentFakturs && recentFakturs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Faktur Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pembeli</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No. Faktur</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Coretax</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentFakturs.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.referensi}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.nama_pembeli}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status_faktur === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        item.status_faktur === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                        item.status_faktur === 'AMENDED' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status_faktur}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {item.nomor_faktur_pajak || '(Belum Ada)'}
                    </td>
                    <td className="px-3 py-2 text-sm">
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
                    <td className="px-3 py-2 text-sm text-blue-600">
                      <Link href={`/faktur/${item.id}`}>
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link href="/faktur" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Lihat Semua Faktur →
            </Link>
          </div>
        </div>
      )}
      
     
    </div>
  );
}