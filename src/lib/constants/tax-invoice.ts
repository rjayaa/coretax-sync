// src/lib/constants/tax-invoice.ts

export const TAB_LIST = ["header", "detail", "preview-xml", "preview-excel"] as const;

export const TRANSACTION_TYPES = [
  { value: 'FULL_PAYMENT', label: 'Pembayaran Penuh' },
  { value: 'DOWN_PAYMENT', label: 'Uang Muka' },
  { value: 'REMAINING_PAYMENT', label: 'Pelunasan' }
] as const;

export const DEFAULT_DETAIL_ITEM = {
  barangJasa: "A",
  kodeBarang: "000000",
  namaBarang: "",
  satuanUkur: "UM.0002",
  hargaSatuan: "0",
  jumlahBarang: "0",
  hargaJualTotal: "0",
  uangMuka: "0",
  potonganHarga: "0",
  dikurangiUangMuka: "0",
  dpp: "0",
  dppNilaiLain: "0",
  tarifPpn: "12",
  ppn: "0",
  tarifPpnbm: "10",
  ppnbm: "0"
};

// Tax rates
export const TAX_RATES = {
  PPN: 12,    // 12%
  PPNBM: 10,  // 10%
  DPP_MULTIPLIER: 11/12  // 11/12 untuk perhitungan DPP Nilai Lain
} as const;