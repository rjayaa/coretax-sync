
// src/lib/utils/excelGenerator.ts
import * as XLSX from 'xlsx';
import { FakturData, DetailFakturData } from '@/types/faktur';

export const generateExcelFile = (
  fakturList: (FakturData & { id: string })[],
  detailList: DetailFakturData[]
) => {
  if (!fakturList || fakturList.length === 0) {
    console.error('No faktur data provided');
    throw new Error('Data faktur tidak tersedia untuk di-export');
  }

  console.log('Generating Excel file for:', {
    faktursCount: fakturList.length,
    detailsCount: detailList.length,
    sampleFaktur: fakturList[0]
  });

  const npwpPenjual = fakturList[0].npwp_penjual;
  
  const padWithZeros = (value: string | null | undefined, length: number = 6) => {
    if (!value) return '';
    return value.padStart(length, '0');
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
      item.npwp_nik_pembeli || '',
      item.jenis_id_pembeli || 'TIN',
      item.negara_pembeli || 'IDN',
      item.nomor_dokumen_pembeli || '',
      item.nama_pembeli || '',
      item.alamat_pembeli || '',
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
    ...detailList.map((item, index) => {
      // Tentukan jumlah_barang_jasa dari jumlah_barang atau jumlah_jasa
      const jumlahBarangJasa = item.jumlah_barang_jasa || 
                             (item.barang_or_jasa === 'a' ? item.jumlah_barang : item.jumlah_jasa) || 
                             '1';
                             
      // Tentukan total_diskon
      const totalDiskon = item.total_diskon || '0';
                             
      return [
        (index + 1).toString(),
        item.barang_or_jasa.toUpperCase(),
        item.kode_barang_or_jasa || '', 
        item.nama_barang_or_jasa || '',
        item.nama_satuan_ukur || '',
        formatNumber(item.harga_satuan),
        formatNumber(jumlahBarangJasa),
        formatNumber(totalDiskon),
        formatNumber(item.dpp),
        formatNumber(item.dpp_nilai_lain || 0),
        formatNumber(item.tarif_ppn || 11),
        formatNumber(item.ppn),
        formatNumber(item.tarif_ppnbm || 0),
        formatNumber(item.ppnbm || 0)
      ];
    }),
    ['END']
  ];

  try {
    const fakturWs = XLSX.utils.aoa_to_sheet(fakturData);
    const detailWs = XLSX.utils.aoa_to_sheet(detailData);
    
    // Set format cell dengan penanganan error
    const setNumberFormat = (ws: XLSX.WorkSheet, startRow: number, columns: number[]) => {
      try {
        if (!ws || !ws['!ref']) {
          console.warn('Invalid worksheet or missing !ref');
          return;
        }
        
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let row = startRow; row <= range.e.r; row++) {
          columns.forEach(col => {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws[cellRef]) {
              ws[cellRef].z = '0.00'; // Format angka tanpa pemisah ribuan, 2 desimal
              ws[cellRef].t = 'n';    // Set tipe data sebagai number
            }
          });
        }
      } catch (error) {
        console.error('Error setting number format:', error);
      }
    };

    // Format numeric columns di DetailFaktur sheet - dengan penanganan error
    try {
      setNumberFormat(detailWs, 1, [5, 6, 7, 8, 9, 10, 11, 12, 13]); // Sesuaikan dengan indeks kolom numerik
    } catch (error) {
      console.warn('Error formatting detail numbers:', error);
    }

    // Set text format untuk kolom dengan safe check
    const setTextFormat = (ws: XLSX.WorkSheet, colLetter: string, startRow: number, endRow: number) => {
      try {
        if (!ws) return;
        
        for (let i = startRow; i <= endRow; i++) {
          const cellRef = `${colLetter}${i}`;
          if (ws[cellRef]) {
            ws[cellRef].z = '@';
          }
        }
      } catch (error) {
        console.warn(`Error setting text format for column ${colLetter}:`, error);
      }
    };

    // Safely set cell format
    const setSingleCellFormat = (ws: XLSX.WorkSheet, cellRef: string, format: string) => {
      try {
        if (ws[cellRef]) {
          ws[cellRef].z = format;
        }
      } catch (error) {
        console.warn(`Error setting format for cell ${cellRef}:`, error);
      }
    };

    // Menerapkan format teks untuk kolom-kolom tertentu
    try {
      if (fakturList.length > 0) {
        setTextFormat(fakturWs, 'I', 3, fakturList.length + 3); // ID TKU Penjual
        setTextFormat(fakturWs, 'Q', 3, fakturList.length + 3); // ID TKU Pembeli
        
        // Pastikan C1 ada sebelum mencoba mengatur format
        if (fakturWs['C1']) {
          setSingleCellFormat(fakturWs, 'C1', '@');               // NPWP Penjual
        }
      }
      
      if (detailList.length > 0) {
        setTextFormat(detailWs, 'C', 1, detailList.length + 2); // Kode Barang Jasa
      }
    } catch (error) {
      console.warn('Error applying text formats:', error);
    }

    // Set column widths safely
    try {
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
    } catch (error) {
      console.warn('Error setting column widths:', error);
    }

    // Set merged cells safely
    try {
      fakturWs['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
      ];
    } catch (error) {
      console.warn('Error setting merged cells:', error);
    }

    // Add worksheets to workbook
    try {
      XLSX.utils.book_append_sheet(wb, fakturWs, "Faktur");
      XLSX.utils.book_append_sheet(wb, detailWs, "DetailFaktur");
      
      // Empty sheets
      const refWs = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.book_append_sheet(wb, refWs, "REF");
      
      const keteranganWs = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.book_append_sheet(wb, keteranganWs, "Keterangan");
    } catch (error) {
      console.error('Error appending worksheets:', error);
      throw new Error('Failed to create Excel file: ' + error.message);
    }
    
    // Create and download file
    try {
      const fileName = `Export_Coretax_${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log(`Exporting file: ${fileName}`);
      XLSX.writeFile(wb, fileName);
      console.log('Excel file generated successfully');
    } catch (error) {
      console.error('Error writing Excel file:', error);
      throw new Error('Failed to download Excel file: ' + error.message);
    }
  } catch (error) {
    console.error('Exception in Excel generation:', error);
    throw error;
  }
};