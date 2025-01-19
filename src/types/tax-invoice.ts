// src/types/tax-invoice.ts

export type TransactionType = 'FULL_PAYMENT' | 'DOWN_PAYMENT' | 'REMAINING_PAYMENT';
export type TabType = 'header' | 'detail' | 'preview-xml' | 'preview-excel';

export interface HeaderData {
  npwpPenjual: string;
  jenisTransaksi: TransactionType;
}

export interface FakturData {
  tanggalFaktur: string;
  jenisFaktur: string;
  kodeTransaksi: string;
  keteranganTambahan: string;
  dokumenPendukung: string;
  referensi: string;
  capFasilitas: string;
  idTkuPenjual: string;
  npwpPembeli: string;
  jenisIdPembeli: string;
  negaraPembeli: string;
  nomorDokumenPembeli: string;
  namaPembeli: string;
  alamatPembeli: string;
  emailPembeli: string;
  idTkuPembeli: string;
  keterangan: string;
  ctrl: string;
  referensiInvoiceDP: string; // Referensi ke invoice DP jika ini pelunasan
}

export interface DetailItem {
  barangJasa: string;
  kodeBarang: string;
  namaBarang: string;
  satuanUkur: string;
  hargaSatuan: string;
  jumlahBarang: string;
  hargaJualTotal: string;    // Total harga sebelum pajak
  uangMuka: string;          // Nilai DP jika transaksi DP
  potonganHarga: string;     // Diskon
  dikurangiUangMuka: string; // Nilai DP yang dikurangkan (untuk pelunasan)
  dpp: string;               // Dasar Pengenaan Pajak
  dppNilaiLain: string;      // DPP * 11/12
  tarifPpn: string;          // Default 12%
  ppn: string;               // DPP Nilai Lain * 12%
  tarifPpnbm: string;        // Default 10%
  ppnbm: string;             // Harga Jual * tarif PPnBM
}