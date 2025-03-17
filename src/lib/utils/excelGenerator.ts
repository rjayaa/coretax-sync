// src/lib/utils/excelGenerator.ts
import * as XLSX from 'xlsx';
import { FakturData, DetailFakturData } from '@/types/faktur';

export const generateExcelFile = (
  fakturList: (FakturData & { id: string })[],
  detailList: DetailFakturData[]
) => {
  const npwpPenjual = fakturList[0].npwp_penjual;
  
  const padWithZeros = (value: string, length: number = 6) => {
    return value ? value.padStart(length, '0') : '';
  };

  // Helper untuk memformat angka
  const formatNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    // Konversi ke number dan bulatkan ke 2 desimal
    return Math.round(parseFloat(value.toString()) * 100) / 100;
  };

  const wb = XLSX.utils.book_new();
    
  // Faktur Sheet
  const fakturData = [
    ['NPWP Penjual', null, npwpPenjual],
    [],
    [
      'Baris',
      'Tanggal Faktur',
      'Jenis Faktur',
      'Kode Transaksi',
      'Keterangan Tambahan',
      'Dokumen Pendukung',
      'Referensi',
      'Cap Fasilitas',
      'ID TKU Penjual',
      'NPWP/NIK Pembeli',
      'Jenis ID Pembeli',
      'Negara Pembeli',
      'Nomor Dokumen Pembeli',
      'Nama Pembeli',
      'Alamat Pembeli',
      'Email Pembeli',
      'ID TKU Pembeli'
    ],
    ...fakturList.map((item, index) => [
      (index + 1).toString(),
      item.tanggal_faktur,
      item.jenis_faktur,
      item.kode_transaksi,
      item.keterangan_tambahan || '',
      item.dokumen_pendukung || '',
      item.referensi || '',
      item.cap_fasilitas || '',
      padWithZeros(item.id_tku_penjual),
      item.npwp_nik_pembeli,
      item.jenis_id_pembeli,
      item.negara_pembeli,
      item.nomor_dokumen_pembeli || '',
      item.nama_pembeli,
      item.alamat_pembeli,
      item.email_pembeli || '',
      padWithZeros(item.id_tku_pembeli)
    ]),
    ['END']
  ];

  const detailData = [
    [
      'Baris',
      'Barang/Jasa',
      'Kode Barang Jasa',
      'Nama Barang/Jasa',
      'Nama Satuan Ukur',
      'Harga Satuan',
      'Jumlah Barang Jasa',
      'Total Diskon',
      'DPP',
      'DPP Nilai Lain',
      'Tarif PPN',
      'PPN',
      'Tarif PPnBM',
      'PPnBM'
    ],
    ...detailList.map((item, index) => [
      (index + 1).toString(),
      item.barang_or_jasa.toUpperCase(),
      item.kode_barang_or_jasa || '', // Use kode_barang_or_jasa from database
      item.nama_barang_or_jasa || '',
      item.nama_satuan_ukur,
      formatNumber(item.harga_satuan),
      formatNumber(item.jumlah_barang_jasa),
      formatNumber(item.total_diskon || 0),
      formatNumber(item.dpp),
      formatNumber(item.dpp_nilai_lain || 0),
      formatNumber(item.tarif_ppn || 11),
      formatNumber(item.ppn),
      formatNumber(item.tarif_ppnbm || 0),
      formatNumber(item.ppnbm || 0)
    ]),
    ['END']
  ];

  const fakturWs = XLSX.utils.aoa_to_sheet(fakturData);
  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  
  // Set format cell untuk memastikan angka ditampilkan dengan benar
  const setNumberFormat = (ws: XLSX.WorkSheet, startRow: number, columns: number[]) => {
    for (let row = startRow; row < (ws['!ref'] ? parseInt(ws['!ref'].split(':')[1].replace(/[A-Z]/g, '')) : 0); row++) {
      columns.forEach(col => {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellRef]) {
          ws[cellRef].z = '0.00'; // Format angka tanpa pemisah ribuan, 2 desimal
          ws[cellRef].t = 'n';    // Set tipe data sebagai number
        }
      });
    }
  };

  // Format numeric columns di DetailFaktur sheet
  setNumberFormat(detailWs, 1, [5, 6, 7, 8, 9, 10, 11, 12, 13]); // Sesuaikan dengan indeks kolom numerik

  // Set text format untuk kolom ID TKU dan kode barang/jasa
  const setTextFormat = (ws: XLSX.WorkSheet, col: string) => {
    for (let i = 3; i < fakturList.length + 3; i++) {
      const cellRef = `${col}${i}`;
      if (ws[cellRef]) {
        ws[cellRef].z = '@';
      }
    }
  };

  // Set text format untuk kolom kode barang/jasa di detail sheet
  const setDetailTextFormat = (ws: XLSX.WorkSheet, col: string) => {
    for (let i = 1; i < detailList.length + 2; i++) {
      const cellRef = `${col}${i}`;
      if (ws[cellRef]) {
        ws[cellRef].z = '@';
      }
    }
  };

  setTextFormat(fakturWs, 'I'); // ID TKU Penjual
  setTextFormat(fakturWs, 'Q'); // ID TKU Pembeli
  fakturWs['C1'].z = '@';      // NPWP Penjual
  setDetailTextFormat(detailWs, 'C'); // Kode Barang Jasa

  // Set column widths
  fakturWs['!cols'] = [
    { width: 7 }, { width: 16.140625 }, { width: 11 },
    { width: 17.28515625 }, { width: 18.42578125 }, { width: 22.5703125 },
    { width: 11 }, { width: 18.85546875 }, { width: 23.42578125 },
    { width: 21.140625 }, { width: 27.7109375 }, { width: 21.42578125 },
    { width: 29.140625 }, { width: 12 }, { width: 23.42578125 },
    { width: 22 }, { width: 23.42578125 }
  ];

  detailWs['!cols'] = [
    { width: 7 }, { width: 11 }, { width: 16.85546875 },
    { width: 17.28515625 }, { width: 17.42578125 }, { width: 12.42578125 },
    { width: 12 }, { width: 11.85546875 }, { width: 12 },
    { width: 13.28515625 }, { width: 11 }, { width: 11 },
    { width: 11.7109375 }, { width: 11 }
  ];

  // Set merged cells
  fakturWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
  ];

  XLSX.utils.book_append_sheet(wb, fakturWs, 'Faktur');
  XLSX.utils.book_append_sheet(wb, detailWs, 'DetailFaktur');
  
  // Empty sheets
  const refWs = XLSX.utils.aoa_to_sheet([[]]);
  XLSX.utils.book_append_sheet(wb, refWs, 'REF');
  
  const keteranganWs = XLSX.utils.aoa_to_sheet([[]]);
  XLSX.utils.book_append_sheet(wb, keteranganWs, 'Keterangan');
  
  XLSX.writeFile(wb, 'faktur_export.xlsx');
};