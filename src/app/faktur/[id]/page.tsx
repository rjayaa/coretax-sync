
//src/app/faktur/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';
import StatusBadge from '@/components/StatusBadge';
import { FakturData, DetailFakturData } from '@/types/faktur';

type FakturDetailProps = {
  params: { id: string };
};

type FakturDataWithId = FakturData & {
  id: string;
  coretax_record_id: string | null;
  is_uploaded_to_coretax: boolean;
  last_sync_date: string | null;
  amended_from_faktur_id: string | null;
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
};

// Definisi tipe untuk item dalam rantai transaksi
type ChainItem = FakturDataWithId & {
  detailCount: number;
  totalDPP: number;
  totalPPN: number;
  grandTotal: number;
  transactionType: string;
};

// Definisi tipe untuk respons transaksi terkait
type RelatedTransactions = {
  original: FakturDataWithId;
  related: FakturDataWithId[];
  chain: ChainItem[];
};

export default function FakturDetailPage({ params }: FakturDetailProps) {
  const [faktur, setFaktur] = useState<FakturDataWithId | null>(null);
  const [detailItems, setDetailItems] = useState<DetailFakturData[]>([]);
  const [coretaxData, setCoretaxData] = useState<CoretaxData | null>(null);
  const [amendedFakturs, setAmendedFakturs] = useState<FakturDataWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [relatedTransactions, setRelatedTransactions] = useState<{
  original: FakturDataWithId;
  related: FakturDataWithId[];
  chain: ChainItem[];
  detailItems: Record<string, DetailFakturData[]>;
}>({
  original: {} as FakturDataWithId,
  related: [],
  chain: [],
  detailItems: {}
});


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
        
        // Fetch transaksi terkait (rantai DP-Pelunasan)
        const relatedResponse = await fetch(`/api/faktur/${params.id}/related`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedTransactions(relatedData);
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
          {/* <Link 
            href={`/faktur/${faktur.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Faktur
          </Link> */}
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
          <StatusBadge status={faktur.status_faktur || ''} type="faktur" />
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

      {/* Transaksi Terkait (Rantai DP-Pelunasan) di bagian atas */}
      {relatedTransactions.chain && relatedTransactions.chain.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Rantai Transaksi (DP-Pelunasan)</h2>
          <p className="text-sm text-gray-500 mb-3">
            Menampilkan rangkaian transaksi dari DP hingga pelunasan untuk referensi {faktur.referensi?.split('/')[0]}.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total DPP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total PPN</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedTransactions.chain.map((item, index) => {
                  const isCurrentFaktur = item.id === faktur.id;
                  return (
                    <tr key={index} className={isCurrentFaktur ? "bg-blue-50" : ""}>
                      <td className="px-3 py-2 text-sm font-medium">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.transactionType === "DP" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {item.transactionType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{item.referensi || "-"}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {new Date(item.tanggal_faktur).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <StatusBadge status={item.status_faktur || "UNKNOWN"} type="faktur" />
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.totalDPP.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {item.totalPPN.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                        {item.grandTotal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {isCurrentFaktur ? (
                          <span className="text-blue-600 font-medium">Sedang Dilihat</span>
                        ) : (
                          <Link href={`/faktur/${item.id}`} className="text-blue-600 hover:underline">
                            Lihat Detail
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* {relatedTransactions.chain.length > 1 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-sm font-bold text-right">Total Keseluruhan:</td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                      {relatedTransactions.chain.reduce((sum, item) => sum + item.totalDPP, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                      {relatedTransactions.chain.reduce((sum, item) => sum + item.totalPPN, 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                      {relatedTransactions.chain.reduce((sum, item) => sum + item.grandTotal, 0).toLocaleString('id-ID')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )} */}
            </table>
          </div>
        </div>
      )}
      
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
          
          {/* {coretaxData.amended_record_id && (
            <div className="mt-4 p-3 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-700">
                <strong>Perhatian:</strong> Faktur ini adalah amendemen dari faktur lain dengan Record ID: {coretaxData.amended_record_id}
              </p>
            </div>
          )} */}
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
                      <StatusBadge status={item.status_faktur || ''} type="faktur" />
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



{/* Detail Items - Including All Related Transactions */}
<div className="bg-white rounded-lg shadow-md p-6 mb-6">
  <h2 className="text-xl font-semibold mb-4">Detail Barang/Jasa dan Perhitungan DP-Pelunasan</h2>
  
  {detailItems.length === 0 && Object.keys(relatedTransactions.detailItems).length === 0 ? (
    <p className="text-gray-500">Belum ada data detail faktur.</p>
  ) : (
    <>
      {/* Tabel detail barang/jasa */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaksi</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang/Jasa</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">DPP</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PPN</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {relatedTransactions.chain.map((chainItem) => {
              const isCurrentFaktur = chainItem.id === faktur.id;
              const itemDetails = isCurrentFaktur 
                ? detailItems 
                : (relatedTransactions.detailItems[chainItem.id] || []);
              
              return (
                <React.Fragment key={chainItem.id}>
                  {/* Header untuk transaksi */}
                  <tr className={`${isCurrentFaktur ? 'bg-blue-100' : 'bg-gray-100'} border-t-2 border-gray-300`}>
                    <td colSpan={8} className="px-3 py-2 text-sm font-medium">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block px-2 py-1 mr-2 rounded text-xs font-medium ${
                            chainItem.transactionType === "DP" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"
                          }`}>
                            {chainItem.transactionType}
                          </span>
                          <span className="font-medium">{chainItem.referensi} ({new Date(chainItem.tanggal_faktur).toLocaleDateString('id-ID')})</span>
                        </div>
                        {!isCurrentFaktur && (
                          <Link href={`/faktur/${chainItem.id}`} className="text-blue-600 hover:underline text-xs">
                            Lihat detail faktur
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Detail barang/jasa untuk transaksi ini */}
                  {itemDetails.map((item, index) => (
                    <tr key={`${chainItem.id}-${index}`} className={isCurrentFaktur ? "bg-blue-50" : ""}>
                      <td className="px-3 py-2 text-sm"></td>
                      <td className="px-3 py-2 text-sm text-gray-900"></td>
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
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      
      {relatedTransactions.chain && relatedTransactions.chain.length > 1 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          {/* <h3 className="text-lg font-semibold mb-3">Rincian Perhitungan DP-Pelunasan</h3> */}
          
          {/* {(() => {
            // Identifikasi transaksi DP dan Pelunasan
            const dpTransactions = relatedTransactions.chain.filter(item => item.transactionType === "DP");
            const pelunasanTransactions = relatedTransactions.chain.filter(item => item.transactionType === "Pelunasan");
            
            // Hitung total DPP dan PPN untuk DP dan Pelunasan
            const totalDpDpp = dpTransactions.reduce((sum, item) => sum + item.totalDPP, 0);
            const totalDpPpn = dpTransactions.reduce((sum, item) => sum + item.totalPPN, 0);
            const totalDpGrand = totalDpDpp + totalDpPpn;
            
            const totalPelunasanDpp = pelunasanTransactions.reduce((sum, item) => sum + item.totalDPP, 0);
            const totalPelunasanPpn = pelunasanTransactions.reduce((sum, item) => sum + item.totalPPN, 0);
            const totalPelunasanGrand = totalPelunasanDpp + totalPelunasanPpn;
            
            // Total nilai kontrak
            const totalKontrakDpp = totalDpDpp + totalPelunasanDpp;
            const totalKontrakPpn = totalDpPpn + totalPelunasanPpn;
            const totalKontrakGrand = totalKontrakDpp + totalKontrakPpn;
            
            return (
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Keterangan</th>
                    <th className="text-right py-2">DPP</th>
                    <th className="text-right py-2">PPN</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Nilai Total Kontrak</td>
                    <td className="text-right py-2">{totalDpDpp.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2">{totalDpPpn.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2 font-medium">{totalDpGrand.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Nilai Pelunasan</td>
                    <td className="text-right py-2">{totalPelunasanDpp.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2">{totalPelunasanPpn.toLocaleString('id-ID')}</td>
                    <td className="text-right py-2">{totalPelunasanGrand.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-2 font-medium">Nilai DP (Selisih)</td>
                    <td className="text-right py-2 font-medium">{(totalDpDpp - totalPelunasanDpp).toLocaleString('id-ID')}</td>
                    <td className="text-right py-2 font-medium">{(totalDpPpn - totalPelunasanPpn).toLocaleString('id-ID')}</td>
                    <td className="text-right py-2 font-medium">{(totalDpGrand - totalPelunasanGrand).toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            );
          })()} */}
        </div>
      )}
    </>
  )}
</div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {/* <Link
          href={`/faktur/${faktur.id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit Faktur
        </Link> */}
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