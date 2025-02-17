import * as XLSX from 'xlsx';
import { FakturData, DetailFakturData } from '@/types/faktur';

export const generateExcelFile = (
  fakturList: (FakturData & { id: string })[],
  detailList: DetailFakturData[]
) => {
const npwpPenjual = fakturList[0].npwp_penjual;
    const wb = XLSX.utils.book_new();
    const padWithZeros = (value: string, length: number = 6) => {
    return value ? value.padStart(length, '0') : '';
  };
    
  // Faktur Sheet
  const fakturData = [
    ['NPWP Penjual', null,npwpPenjual ],
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
        padWithZeros(item.id_tku_penjual)|| ''
      ]),
    ['END']
  ];

  const fakturWs = XLSX.utils.aoa_to_sheet(fakturData);
  
  // Set formatting for Faktur sheet
  fakturWs['C1'].z = '@';
  fakturWs['!cols'] = [
    { width: 7 }, { width: 16.140625 }, { width: 11 },
    { width: 17.28515625 }, { width: 18.42578125 }, { width: 22.5703125 },
    { width: 11 }, { width: 18.85546875 }, { width: 23.42578125 },
    { width: 21.140625 }, { width: 27.7109375 }, { width: 21.42578125 },
    { width: 29.140625 }, { width: 12 }, { width: 23.42578125 },
    { width: 22 }, { width: 23.42578125 }
  ];
  
  fakturWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
  ];
  
  XLSX.utils.book_append_sheet(wb, fakturWs, 'Faktur');
  
  // DetailFaktur Sheet
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
   ...detailList.map((item, index) => {
        const jumlahBarangJasa = item.barang_or_jasa === 'a' ? 
          item.jumlah_barang || item.jumlah_barang_jasa : 
          item.jumlah_jasa || item.jumlah_barang_jasa;

        return [
          (index + 1).toString(),
          item.barang_or_jasa.toUpperCase(),
          item.kode_barang_or_jasa || '',
          item.nama_barang_or_jasa,
          item.nama_satuan_ukur,
          item.harga_satuan,
          jumlahBarangJasa,
          (item.total_diskon || item.diskon_persen || '0.00').toString(),
          item.dpp,
          item.dpp_nilai_lain,
          item.tarif_ppn,
          item.ppn,
          '0',
          '0'
        ];
      }),
    ['END']
  ];
  
  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  
  // Set column widths for DetailFaktur sheet
  detailWs['!cols'] = [
    { width: 7 }, { width: 11 }, { width: 16.85546875 },
    { width: 17.28515625 }, { width: 17.42578125 }, { width: 12.42578125 },
    { width: 12 }, { width: 11.85546875 }, { width: 12 },
    { width: 13.28515625 }, { width: 11 }, { width: 11 },
    { width: 11.7109375 }, { width: 11 }
  ];
  
  XLSX.utils.book_append_sheet(wb, detailWs, 'DetailFaktur');
  
  // Add empty sheets
  const refWs = XLSX.utils.aoa_to_sheet([[]]);
  XLSX.utils.book_append_sheet(wb, refWs, 'REF');
  
  const keteranganWs = XLSX.utils.aoa_to_sheet([[]]);
  XLSX.utils.book_append_sheet(wb, keteranganWs, 'Keterangan');
  
  // Export the file
  XLSX.writeFile(wb, 'faktur_export.xlsx');
};