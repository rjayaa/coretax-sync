// src/lib/db/schema/index.ts
import {
  faktur,
  fakturRelations,
  type Faktur,
  type NewFaktur
} from './faktur';

import {
  detailFaktur,
  detailFakturRelations,
  type DetailFaktur,
  type NewDetailFaktur,
  calculateDerivedValues
} from './detail-faktur';

import {
  refKodeTransaksi,
  refKeteranganTambahan,
  refCapFasilitas,
  refJenisPembeli,
  type RefKodeTransaksi,
  type RefKeteranganTambahan,
  type RefCapFasilitas,
  type RefJenisPembeli
} from './references';

import {
  taxMasterBarang,
  taxMasterCompany,
  taxMasterCustomer,
  taxMasterJasa,
  taxUserRoles
} from './master';

// Export all schema elements
export {
  // Main tables
  faktur,
  detailFaktur,
  
  // Reference tables
  refKodeTransaksi,
  refKeteranganTambahan,
  refCapFasilitas,
  refJenisPembeli,
  
  // Master tables
  taxMasterBarang,
  taxMasterCompany,
  taxMasterCustomer,
  taxMasterJasa,
  taxUserRoles,
  
  // Relations
  fakturRelations,
  detailFakturRelations,
  
  // Utility functions
  calculateDerivedValues,
  
  // Types
  type Faktur,
  type NewFaktur,
  type DetailFaktur,
  type NewDetailFaktur,
  type RefKodeTransaksi,
  type RefKeteranganTambahan,
  type RefCapFasilitas,
  type RefJenisPembeli
};

// Helper type untuk request body dari form
export interface CreateInvoiceRequest {
  header: {
    nomorFaktur: string;
    npwpPenjual: string;
    tanggalFaktur: string | Date;
    jenisFaktur?: string;
    kodeTransaksi: string;
    keteranganTambahanKode?: string;
    capFasilitasKode?: string;
    nomorInvoice: string;
    idTkuPenjual?: string;
    npwpPembeli: string;
    jenisIdPembeli?: string;
    namaPembeli: string;
    alamatPembeli: string;
    emailPembeli?: string;
    idTkuPembeli?: string;
  };
  details: {
    barangJasa: 'B' | 'J';
    kodeBarangJasa: string;
    namaBarangJasa: string;
    namaSatuanUkur: string;
    hargaSatuan: number;
    jumlah: number;
    diskon?: number;
    tarifPpnbm?: number;
  }[];
}

// Helper functions untuk transformasi data
export const transformCustomerToHeader = (customer: typeof taxMasterCustomer.$inferSelect) => ({
  npwpPembeli: customer.npwp,
  namaPembeli: customer.nama,
  alamatPembeli: [
    customer.jalan,
    customer.blok,
    customer.nomor,
    customer.rt && customer.rw ? `RT ${customer.rt} RW ${customer.rw}` : '',
    customer.kelurahan,
    customer.kecamatan,
    customer.kabupaten,
    customer.propinsi,
    customer.kode_pos
  ].filter(Boolean).join(', ')
});

export const transformCompanyToHeader = (company: typeof taxMasterCompany.$inferSelect) => ({
  npwpPenjual: company.npwp_company || '',
  company_name: company.company_name,
  company_code: company.company_code
});