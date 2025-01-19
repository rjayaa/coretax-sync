// src/lib/utils/excel-generator.ts
import * as XLSX from 'xlsx';
import type { FakturData, DetailItem } from "@/types/tax-invoice";

interface GenerateExcelProps {
  fakturData: FakturData;
  detailItems: DetailItem[];
}

export const generateExcel = ({ fakturData, detailItems }: GenerateExcelProps): void => {
  try {
    // 1. Buat data untuk sheet "Rekapan berupa Imporan"
    const fullRows = detailItems.map((item, index) => ({
      'Baris': index + 1,
      'Tanggal Faktur': fakturData.tanggalFaktur,
      'Jenis Faktur': fakturData.jenisFaktur,
      'Kode FP': fakturData.kodeTransaksi,
      'Keterangan Tambahan': fakturData.keteranganTambahan,
      'Dokumen Pendukung': fakturData.dokumenPendukung,
      'Referensi': fakturData.referensi,
      'Cap Fasilitas': fakturData.capFasilitas,
      'ID TKU Penjual': fakturData.idTkuPenjual,
      'NPWP/NIK Pembeli': fakturData.npwpPembeli,
      'Jenis ID Pembeli': fakturData.jenisIdPembeli,
      'Negara Pembeli': fakturData.negaraPembeli,
      'Nomor Dokumen Pembeli': fakturData.nomorDokumenPembeli,
      'Nama Pembeli': fakturData.namaPembeli,
      'Alamat Pembeli': fakturData.alamatPembeli,
      'Email Pembeli': fakturData.emailPembeli,
      'ID TKU Pembeli': fakturData.idTkuPembeli,
      'Barang/Jasa': item.barangJasa,
      'Kode Barang Jasa': item.kodeBarang,
      'Nama Barang/Jasa': item.namaBarang,
      'Nama Satuan Ukur': item.satuanUkur,
      'Harga Satuan': Number(item.hargaSatuan),
      'Jumlah Barang/Jasa': Number(item.jumlahBarang),
      'Total Diskon': Number(item.potonganHarga),
      'Harga Jual Total': Number(item.hargaJualTotal),
      'DPP': Number(item.dpp),
      'DPP Nilai Lain': Number(item.dppNilaiLain),
      'Tarif PPN': Number(item.tarifPpn),
      'PPN': Number(item.ppn),
      'Uang Muka': Number(item.uangMuka),
      'PPN Uang Muka': Number(item.ppn),
      'Tarif PPnBM': '',
      'PPnBM': '',
      'Ctrl': fakturData.ctrl,
      'Keterangan': fakturData.keterangan
    }));

    // 2. Buat data untuk sheet "Rekapan FP 2025"
    const summaryRows = detailItems.map((item, index) => ({
      'Baris': index + 1,
      'Tanggal Faktur': fakturData.tanggalFaktur,
      'Referensi': fakturData.referensi,
      'Nama Pembeli': fakturData.namaPembeli,
      'Nama Barang/Jasa': item.namaBarang,
      'Harga Satuan': Number(item.hargaSatuan),
      'Jumlah Barang/Jasa': Number(item.jumlahBarang),
      'Harga Jual Total': Number(item.hargaJualTotal),
      'DPP (Nilai Uang Muka/Pelunasan)': Number(item.dpp),
      'DPP Nilai Lain': Number(item.dppNilaiLain),
      'Tarif PPN': Number(item.tarifPpn),
      'PPN': Number(item.ppn)
    }));

    // Buat workbook baru
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Rekapan berupa Imporan
    const wsDetailed = XLSX.utils.json_to_sheet(fullRows);
    
    // Set format currency untuk kolom nominal di sheet detail
    const detailCurrencyColumns = ['V', 'W', 'X', 'Y', 'Z', 'AA', 'AC', 'AD'];
    for (let i = 2; i <= fullRows.length + 1; i++) {
      detailCurrencyColumns.forEach(col => {
        const cellRef = `${col}${i}`;
        if (wsDetailed[cellRef]) {
          wsDetailed[cellRef].z = '#,##0.00';
          wsDetailed[cellRef].t = 'n';
        }
      });
    }

    // Sheet 2: Rekapan FP 2025
    // Tambahkan header "Rekapan Faktur 2025"
    const summaryHeader = [["Rekapan Faktur 2025"], []];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows, { origin: 'A3' });
    XLSX.utils.sheet_add_aoa(wsSummary, summaryHeader, { origin: 'A1' });
    
    // Set format currency untuk kolom nominal di sheet summary
    const summaryCurrencyColumns = ['F', 'G', 'H', 'I', 'J', 'L'];
    for (let i = 4; i <= summaryRows.length + 3; i++) {
      summaryCurrencyColumns.forEach(col => {
        const cellRef = `${col}${i}`;
        if (wsSummary[cellRef]) {
          wsSummary[cellRef].z = '#,##0.00';
          wsSummary[cellRef].t = 'n';
        }
      });
    }

    // Set lebar kolom untuk kedua sheet
    const wscols = [
      {wch: 6},  // Baris
      {wch: 12}, // Tanggal
      {wch: 15}, // Referensi
      {wch: 20}, // Nama
      {wch: 30}, // Nama Barang
      {wch: 15}, // Harga
      {wch: 15}, // Jumlah
      {wch: 15}, // Total
      {wch: 15}, // DPP
      {wch: 15}, // DPP Lain
      {wch: 10}, // Tarif
      {wch: 15}, // PPN
    ];
    wsDetailed['!cols'] = wscols;
    wsSummary['!cols'] = wscols;

    // Tambahkan kedua sheet ke workbook
    XLSX.utils.book_append_sheet(wb, wsDetailed, "Rekapan berupa Imporan");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Rekapan FP 2025");

    // Simpan file
    XLSX.writeFile(wb, "rekap_faktur_pajak.xlsx");
  } catch (err) {
    throw new Error('Error generating Excel: ' + (err as Error).message);
  }
};