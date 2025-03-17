// src/app/faktur/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';
import StatusBadge from '@/components/StatusBadge';

type FakturDetailProps = {
  params: { id: string };
};

type FakturData = {
  id: string;
  npwp_penjual: string;
  tanggal_faktur: string;
  jenis_faktur: string;
  referensi: string;
  nama_pembeli: string;
  alamat_pembeli: string;
  npwp_nik_pembeli: string;
  status_faktur: string;
  nomor_faktur_pajak: string;
  coretax_record_id: string | null;
  is_uploaded_to_coretax: boolean;
  last_sync_date: string | null;
  amended_from_faktur_id: string | null;
  // Add other properties as needed
};

type DetailFakturData = {
  id_detail_faktur: string;
  nama_barang_or_jasa: string;
  nama_satuan_ukur: string;
  jumlah_barang: number;
  harga_satuan: string;
  dpp: string;
  ppn: string;
  // Add other properties as needed
};

type CoretaxData = {
  record_id: string;
  tax_invoice_number: string;
  tax_invoice_status: string;
  e_sign_status: string;
  signer: string;
  creation_date: string;
  last_updated_date: string;
  amended_record_id: string | null;
  // Add other properties as needed
};

export default function FakturDetailPage({ params }: FakturDetailProps) {
  const [faktur, setFaktur] = useState<FakturData | null>(null);
  const [detailItems, setDetailItems] = useState<DetailFakturData[]>([]);
  const [coretaxData, setCoretaxData] = useState<CoretaxData | null>(null);
  const [amendedFakturs, setAmendedFakturs] = useState<FakturData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch faktur data
        const fakturResponse = await fetch(`/api/faktur/${params.id}`);
        if (!fakturResponse.ok) throw new Error('Gagal mengambil data faktur');
        const fakturData = await fakturResponse.json();
        setFaktur(fakturData);
        
        // Fetch detail items
        const detailResponse = await fetch(`/api/faktur/${params.id}/details`);
        if (!detailResponse.ok) throw new Error('Gagal mengambil data detail faktur');
        const detailData = await detailResponse.json();
        setDetailItems(detailData);
        
        // If faktur has coretax_record_id, fetch coretax data
        if (fakturData.coretax_record_id) {
          const coretaxResponse = await fetch(`/api/coretax/${fakturData.coretax_record_id}`);
          if (coretaxResponse.ok) {
            const coretaxData = await coretaxResponse.json();
            setCoretaxData(coretaxData);
          }
        }
        
        // Check for amended fakturs
        if (fakturData.id) {
          const amendedResponse = await fetch(`/api/faktur/${params.id}/amended`);
          if (amendedResponse.ok) {
            const amendedData = await amendedResponse.json();
            setAmendedFakturs(amendedData);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <Loading />;
  }

  if (error && !faktur) {
    return <ErrorDisplay message={error} onRetry={() => router.refresh()} />;
  }

  if (!faktur) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">Faktur Tidak Ditemukan</h2>
          <p className="text-yellow-600">Data faktur dengan ID {params.id} tidak ditemukan.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalDPP = detailItems.reduce((sum, item) => sum + parseFloat(item.dpp), 0);
  const totalPPN = detailItems.reduce((sum, item) => sum + parseFloat(item.ppn), 0);
  const grandTotal = totalDPP + totalPPN;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Detail Faktur Pajak</h1>
          <p className="text-gray-500">ID: {faktur.id}</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/faktur/${faktur.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Faktur
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Kembali
          </button>
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
      
      {/* Status Bar */}
      <div className={`p-3 rounded-md mb-6 flex justify-between items-center ${
        faktur.status_faktur === 'APPROVED' ? 'bg-green-100' :
        faktur.status_faktur === 'CREATED' ? 'bg-blue-100' :
        faktur.status_faktur === 'AMENDED' ? 'bg-orange-100' :
        'bg-red-100'
      }`}>
        <div>
          <span className="font-semibold">Status: </span>
          <StatusBadge status={faktur.status_faktur} type="faktur" />
        </div>
        
        <div>
          <span className="font-semibold mr-2">Status Coretax:</span>
          <StatusBadge status={faktur.is_uploaded_to_coretax ? 'true' : 'false'} type="sync" />
        </div>
      </div>
      
      {/* Faktur Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informasi Faktur</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Referensi</p>
              <p className="font-semibold">{faktur.referensi}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Tanggal Faktur</p>
              <p className="font-semibold">
                {new Date(faktur.tanggal_faktur).toLocaleDateString('id-ID')}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Jenis Faktur</p>
              <p className="font-semibold">{faktur.jenis_faktur}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Nomor Faktur Pajak</p>
              <p className="font-semibold">
                {faktur.nomor_faktur_pajak || '(Belum Tersedia)'}
              </p>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Penjual</p>
              <p className="font-semibold">{faktur.npwp_penjual}</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Pembeli</p>
              <p className="font-semibold">{faktur.nama_pembeli}</p>
              <p className="text-sm">{faktur.alamat_pembeli}</p>
              <p className="text-sm">NPWP: {faktur.npwp_nik_pembeli}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coretax Data */}
      {coretaxData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Coretax</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Record ID</p>
                <p className="font-semibold">{coretaxData.record_id}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Nomor Faktur Pajak</p>
                <p className="font-semibold">
                  {coretaxData.tax_invoice_number || '(Belum Tersedia)'}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Status Faktur</p>
                <p className="font-semibold">
                  <StatusBadge status={coretaxData.tax_invoice_status} type="faktur" />
                </p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">Status E-Sign</p>
                <p className="font-semibold">
                  <StatusBadge status={coretaxData.e_sign_status || 'Belum Ditandatangani'} type="coretax" />
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Penandatangan</p>
                <p className="font-semibold">{coretaxData.signer || '(Belum Ada)'}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Tanggal Sinkronisasi</p>
                <p className="font-semibold">
                  {faktur.last_sync_date 
                    ? new Date(faktur.last_sync_date).toLocaleString('id-ID')
                    : '(Belum Sinkron)'}
                </p>
              </div>
            </div>
          </div>
          
          {coretaxData.amended_record_id && (
            <div className="mt-4 p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-700">
                <strong>Perhatian:</strong> Faktur ini adalah amendemen dari faktur lain dengan Record ID: {coretaxData.amended_record_id}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Amended Fakturs */}
      {amendedFakturs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Faktur Amendemen</h2>
          <p className="text-sm text-gray-500 mb-3">
            Faktur ini memiliki {amendedFakturs.length} faktur amendemen.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">No. Faktur</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {amendedFakturs.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.referensi}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <StatusBadge status={item.status_faktur} type="faktur" />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {item.nomor_faktur_pajak || '(Belum Ada)'}
                    </td>
                    <td className="px-3 py-2 text-sm text-blue-600">
                      <Link href={`/faktur/${item.id}`}>
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Detail Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Detail Barang/Jasa</h2>
        
        {detailItems.length === 0 ? (
          <p className="text-gray-500">Belum ada data detail faktur.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang/Jasa</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DPP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PPN</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.nama_barang_or_jasa}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.nama_satuan_ukur}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{item.jumlah_barang}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {parseFloat(item.harga_satuan).toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {parseFloat(item.dpp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {parseFloat(item.ppn).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-sm font-bold text-right">Total:</td>
                  <td className="px-3 py-2 text-sm font-bold text-gray-900">
                    {totalDPP.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2 text-sm font-bold text-gray-900">
                    {totalPPN.toLocaleString('id-ID')}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-3 py-2 text-sm font-bold text-right">Grand Total:</td>
                  <td colSpan={2} className="px-3 py-2 text-sm font-bold text-gray-900">
                    {grandTotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Link
          href={`/faktur/${faktur.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Faktur
        </Link>
        {faktur.status_faktur === 'CREATED' && (
          <button
            onClick={() => window.confirm('Anda yakin ingin menghapus faktur ini?')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus Faktur
          </button>
        )}
      </div>
    </div>
  );
}