// // src/types/tax-invoice.d.ts

// export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'EXPORTED';
// export type TransactionType = 'FULL_PAYMENT' | 'DOWN_PAYMENT' | 'REMAINING_PAYMENT';
// export type ItemType = 'GOODS' | 'SERVICE';

// export interface HeaderData {
//   npwpPenjual: string;
//   jenisTransaksi: TransactionType;
// }

// export interface FakturData {
//   tanggalFaktur: string;
//   kodeTransaksi: string;
//   npwpPembeli: string;
//   namaPembeli: string;
//   alamatPembeli: string;
//   emailPembeli: string;
//   referensi?: string;
//   referensiInvoiceDP?: string;
// }

// export interface DetailItem {
//   barangJasa: 'A' | 'B'; // A untuk Barang, B untuk Jasa
//   goods_id?: string;
//   service_id?: string;
//   namaBarang: string;
//   hargaSatuan: string;
//   jumlahBarang: string;
//   hargaJualTotal: string;
// }

// export interface Invoice {
//   id: string;
//   date: string;
//   number: string;
//   customer: string;
//   npwp: string;
//   type: ItemType;
//   dpp: number;
//   ppn: number;
//   status: InvoiceStatus;
//   details: DetailItem[];
// }


// export interface Customer {
//   id: string
//   nama: string
//   npwp: string
//   alamatLengkap: string
// }

// export interface Item {
//   item_type: 'GOODS' | 'SERVICE'
//   goods_id?: string
//   service_id?: string
//   item_name: string
//   unit: string
//   unit_price: number
//   quantity: number
//   total_price: number
// }

// export interface PaymentDetails {
//   nominal: number
//   dpp: number
//   ppn: number
// }


// src/types/tax-invoice.d.ts

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'EXPORTED';
export type TransactionType = 'FULL_PAYMENT' | 'DOWN_PAYMENT' | 'REMAINING_PAYMENT';
export type ItemType = 'GOODS' | 'SERVICE';

export interface Company {
  id: string;
  company_name: string;
  company_code: string;
  npwp_company: string;
  status: string;
}

export interface Customer {
  id: string;
  nama: string;
  npwp: string;
  alamatLengkap: string;
  jalan?: string;
  blok?: string;
  nomor?: string;
  rt?: string;
  rw?: string;
  kecamatan?: string;
  kelurahan?: string;
  kabupaten?: string;
  propinsi?: string;
  kode_pos?: string;
  nomor_telepon?: string;
}

export interface Item {
  id?: string;
  item_type: ItemType;
  goods_id?: string;
  service_id?: string;
  item_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  discount?: number;
  down_payment?: number;
  dpp: number;
  dpp_other: number;
  ppn_rate: number;
  ppn: number;
  ppnbm_rate?: number;
  ppnbm?: number;
}

export interface PaymentDetails {
  nominal: number;
  dpp: number;
  ppn: number;
  ppnbm?: number;
  total: number;
}

export interface InvoiceHeader {
  id: string;
  customer_id: string;
  company_id: string;
  transaction_type: TransactionType;
  invoice_date: Date;
  invoice_type: string;
  transaction_code: string;
  additional_info?: string;
  supporting_doc?: string;
  reference?: string;
  facility_stamp?: string;
  buyer_doc_type?: string;
  buyer_country?: string;
  buyer_doc_number?: string;
  buyer_email?: string;
  reference_dp_invoice?: string;
  status: InvoiceStatus;
  created_by: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
}

export interface InvoiceExport {
  FK: string; // Kode Faktur
  KD_JENIS_TRANSAKSI: string;
  FG_PENGGANTI: string;
  NOMOR_FAKTUR: string;
  TANGGAL_FAKTUR: string;
  NPWP: string;
  NAMA: string;
  ALAMAT_LENGKAP: string;
  DPP: string;
  PPN: string;
  PPNBM?: string;
  IS_CREDITABLE: string;
  REFERENSI?: string;
}

export interface ItemExport {
  FK: string; // Kode Faktur
  KD_JENIS_TRANSAKSI: string;
  FG_PENGGANTI: string;
  NOMOR_FAKTUR: string;
  NAMA_BARANG: string;
  HARGA_SATUAN: string;
  JUMLAH_BARANG: string;
  HARGA_TOTAL: string;
  DISKON: string;
  DPP: string;
  PPN: string;
  TARIF_PPNBM: string;
  PPNBM: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type CustomerResponse = ApiResponse<Customer[]>;
export type ItemResponse = ApiResponse<Item[]>;
export type InvoiceResponse = ApiResponse<InvoiceHeader>;