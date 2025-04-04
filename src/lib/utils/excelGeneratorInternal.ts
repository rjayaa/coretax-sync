import * as XLSX from 'xlsx';
import { FakturData, DetailFakturData } from '@/types/faktur';

export const generateInternalRecapExcelFile = (
  fakturList: (FakturData & { id: string })[],
  detailList: DetailFakturData[]
) => {
  // Helper untuk memformat angka
  const formatNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    // Konversi ke number dan bulatkan ke 2 desimal
    return Math.round(parseFloat(value.toString()) * 100) / 100;
  };

  // Fungsi untuk mendapatkan bulan dalam bahasa Indonesia
  const getMonthName = (date: string | Date) => {
    const monthNames = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const dateObj = new Date(date);
    return monthNames[dateObj.getMonth()];
  };

  // Fungsi untuk mengelompokkan data berdasarkan bulan
  const groupByMonth = (data: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    data.forEach(item => {
      const month = getMonthName(item.tanggal_faktur);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(item);
    });
    
    return grouped;
  };

  // Inisialisasi workbook
  const wb = XLSX.utils.book_new();
  
  // Kelompokkan faktur berdasarkan bulan
  const fakturByMonth = groupByMonth(fakturList);
  
  // =========== SHEET 1: "Rekapan berupa Imporan" ===========
  // Data untuk sheet pertama
  const sheet1Data = [];
  
  // Header baris pertama dan kedua - Tambah 1 kolom untuk nomor faktur
  sheet1Data.push(Array(36).fill(null).map((_, index) => index + 1));
  sheet1Data.push([
    "Baris",
    "Tanggal Faktur",
    "Jenis Faktur",
    "Kode FP",
    "Keterangan Tambahan",
    "Dokumen Pendukung",
    "Referensi",
    "Nomor Faktur Pajak", // KOLOM BARU DITAMBAHKAN DI SINI
    "Cap Fasilitas",
    "ID TKU Penjual",
    "NPWP/NIK Pembeli",
    "Jenis ID Pembeli",
    "Negara Pembeli",
    "Nomor Dokumen Pembeli",
    "Nama Pembeli",
    "Alamat Pembeli",
    "Email Pembeli",
    "ID TKU Pembeli",
    "Nomor HP Pembeli",
    "Nama Kontak Pembeli",
    "Nama Barang/Jasa",
    "Satuan",
    "Harga Satuan",
    "Jumlah Barang/Jasa",
    "Total Diskon",
    "Harga Jual Total",
    "DPP (Nilai Uang Muka/Pelunasan)",
    "DPP",
    "Tarif PPN",
    "PPN",
    "DPP",
    "PPN",
    "Tarif PPnBM",
    "PPnBM",
    "",
    ""
  ]);

  // Data dikelompokkan per bulan
  Object.entries(fakturByMonth).forEach(([month, monthFakturs]) => {
    // Tambahkan baris nama bulan
    sheet1Data.push([month, ...Array(35).fill(null)]);
    
    // Tambahkan data faktur untuk bulan ini
    monthFakturs.forEach((faktur, index) => {
      // Cari detail terkait untuk faktur ini
      const details = detailList.filter(detail => detail.id_faktur === faktur.id);
      
      // Jika ada detail, tambahkan setiap detail sebagai baris terpisah
      if (details.length > 0) {
        details.forEach((detail, detailIndex) => {
          const rowData = [
            index + 1,                  // Baris
            faktur.tanggal_faktur,      // Tanggal Faktur
            faktur.jenis_faktur,        // Jenis Faktur
            faktur.kode_transaksi,      // Kode FP
            faktur.keterangan_tambahan, // Keterangan Tambahan
            faktur.dokumen_pendukung,   // Dokumen Pendukung
            faktur.referensi,           // Referensi
            faktur.nomor_faktur_pajak,  // Nomor Faktur Pajak (BARU)
            faktur.cap_fasilitas,       // Cap Fasilitas
            faktur.id_tku_penjual,      // ID TKU Penjual
            faktur.npwp_nik_pembeli,    // NPWP/NIK Pembeli
            faktur.jenis_id_pembeli,    // Jenis ID Pembeli
            faktur.negara_pembeli,      // Negara Pembeli
            faktur.nomor_dokumen_pembeli, // Nomor Dokumen Pembeli
            faktur.nama_pembeli,        // Nama Pembeli
            faktur.alamat_pembeli,      // Alamat Pembeli
            "",                         // Email Pembeli
            faktur.id_tku_pembeli,      // ID TKU Pembeli
            "",                         // Nomor HP Pembeli
            "",                         // Nama Kontak Pembeli
            detail.nama_barang_or_jasa, // Nama Barang/Jasa
            detail.nama_satuan_ukur,    // Satuan
            formatNumber(detail.harga_satuan),  // Harga Satuan
            formatNumber(detail.jumlah_barang_jasa), // Jumlah Barang/Jasa
            formatNumber(detail.total_diskon),  // Total Diskon
            formatNumber(detail.dpp),    // Harga Jual Total (DPP)
            formatNumber(detail.dpp_nilai_lain), // DPP Nilai Lain
            formatNumber(detail.dpp),    // DPP
            formatNumber(detail.tarif_ppn) / 100, // Tarif PPN (dalam desimal)
            formatNumber(detail.ppn),    // PPN
            formatNumber(detail.dpp),    // DPP (duplikat)
            formatNumber(detail.ppn),    // PPN (duplikat)
            formatNumber(detail.tarif_ppnbm) / 100, // Tarif PPnBM (dalam desimal)
            formatNumber(detail.ppnbm),  // PPnBM
            null,                       // Kosong
            null                        // Kosong
          ];
          
          sheet1Data.push(rowData);
        });
      } else {
        // Jika tidak ada detail, tambahkan baris kosong untuk faktur
        const emptyRow = [
          index + 1,                    // Baris
          faktur.tanggal_faktur,        // Tanggal Faktur
          faktur.jenis_faktur,          // Jenis Faktur
          faktur.kode_transaksi,        // Kode FP
          faktur.keterangan_tambahan,   // Keterangan Tambahan
          faktur.dokumen_pendukung,     // Dokumen Pendukung
          faktur.referensi,             // Referensi
          faktur.nomor_faktur_pajak,    // Nomor Faktur Pajak (BARU)
          faktur.cap_fasilitas,         // Cap Fasilitas
          faktur.id_tku_penjual,        // ID TKU Penjual
          faktur.npwp_nik_pembeli,      // NPWP/NIK Pembeli
          ...Array(25).fill(null)       // Sisa kolom kosong
        ];
        
        sheet1Data.push(emptyRow);
      }
    });
  });

  // =========== SHEET 2: "Rekapan FP 2025" ===========
  // Header untuk sheet kedua
  const sheet2Data = [
    ["Rekapan Faktur 2025", ...Array(13).fill(null)],
    Array(14).fill(null),
    [
      "Baris",
      "Tanggal Faktur",
      "Referensi",
      "Nomor Faktur Pajak", // KOLOM BARU DITAMBAHKAN DI SINI
      "NPWP Pembeli",
      "Nama Pembeli",
      "Nama Barang/Jasa",
      "Harga Satuan",
      "Jumlah Barang/Jasa",
      "Harga Jual Total",
      "DPP (Nilai Uang Muka/Pelunasan)",
      "DPP",
      "Tarif PPN",
      "PPN"
    ]
  ];

  // Tambahkan data untuk sheet kedua (flat, tidak dikelompokkan per bulan)
  detailList.forEach((detail, index) => {
    // Cari faktur terkait
    const faktur = fakturList.find(f => f.id === detail.id_faktur);
    
    if (faktur) {
      const rowData = [
        index + 1,                     // Baris
        faktur.tanggal_faktur,         // Tanggal Faktur
        faktur.referensi,              // Referensi
        faktur.nomor_faktur_pajak,     // Nomor Faktur Pajak (BARU)
        faktur.npwp_nik_pembeli,       // NPWP Pembeli
        faktur.nama_pembeli,           // Nama Pembeli
        detail.nama_barang_or_jasa,    // Nama Barang/Jasa
        formatNumber(detail.harga_satuan),     // Harga Satuan
        formatNumber(detail.jumlah_barang_jasa), // Jumlah Barang/Jasa
        formatNumber(detail.dpp),       // Harga Jual Total
        formatNumber(detail.dpp_nilai_lain),   // DPP Nilai Lain
        formatNumber(detail.dpp),       // DPP
        formatNumber(detail.tarif_ppn) / 100,  // Tarif PPN (dalam desimal)
        formatNumber(detail.ppn)        // PPN
      ];
      
      sheet2Data.push(rowData);
    }
  });

  // Buat worksheet dari data array
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  
  // Set properti worksheet
  ws1['!cols'] = Array(36).fill({ width: 15 }); // Set lebar kolom untuk sheet 1 (sesuaikan dengan jumlah kolom baru)
  ws2['!cols'] = Array(14).fill({ width: 15 }); // Set lebar kolom untuk sheet 2 (sesuaikan dengan jumlah kolom baru)
  
  // Fungsi untuk mengatur format angka
  const setNumberFormat = (ws: XLSX.WorkSheet, startRow: number, columns: number[]) => {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    
    for (let row = startRow; row <= range.e.r; row++) {
      columns.forEach(col => {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellRef]) {
          ws[cellRef].z = '#,##0.00'; // Format angka dengan 2 desimal
          ws[cellRef].t = 'n';       // Set tipe data sebagai number
        }
      });
    }
  };

  // Format angka untuk kedua sheet
  setNumberFormat(ws1, 3, [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]); // Format kolom numerik di sheet 1 (sesuaikan indeks)
  setNumberFormat(ws2, 3, [7, 8, 9, 10, 11, 12, 13]); // Format kolom numerik di sheet 2 (sesuaikan indeks)
  
  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'Rekapan berupa Imporan');
  XLSX.utils.book_append_sheet(wb, ws2, 'Rekapan FP 2025');
  
  // Simpan file Excel
  XLSX.writeFile(wb, 'rekapan_internal.xlsx');
};