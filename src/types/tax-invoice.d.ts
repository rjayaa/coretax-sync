// src/types/tax-invoice.d.ts

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'EXPORTED';
export type TransactionType = 'FULL_PAYMENT' | 'DOWN_PAYMENT' | 'REMAINING_PAYMENT';
export type ItemType = 'GOODS' | 'SERVICE';

export interface HeaderData {
  npwpPenjual: string;
  jenisTransaksi: TransactionType;
}

export interface FakturData {
  tanggalFaktur: string;
  kodeTransaksi: string;
  npwpPembeli: string;
  namaPembeli: string;
  alamatPembeli: string;
  emailPembeli: string;
  referensi?: string;
  referensiInvoiceDP?: string;
}

export interface DetailItem {
  barangJasa: 'A' | 'B'; // A untuk Barang, B untuk Jasa
  goods_id?: string;
  service_id?: string;
  namaBarang: string;
  hargaSatuan: string;
  jumlahBarang: string;
  hargaJualTotal: string;
}

export interface Invoice {
  id: string;
  date: string;
  number: string;
  customer: string;
  npwp: string;
  type: ItemType;
  dpp: number;
  ppn: number;
  status: InvoiceStatus;
  details: DetailItem[];
}