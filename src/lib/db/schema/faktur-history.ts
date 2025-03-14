// src/lib/db/schema/invoice-history.ts
import { varchar, date, mysqlTable, char, mysqlEnum, timestamp, decimal, int, text, boolean } from 'drizzle-orm/mysql-core';
import { faktur } from './faktur';

/**
 * Table to track complete invoice amendment history
 * This stores a full history of all changes to invoices over time,
 * allowing tracking of all amendments and previous versions
 */
export const fakturHistory = mysqlTable('T_L_EFW_TAX_FAKTUR_HISTORY', {
  // Primary key
  id: char('id', { length: 36 }).primaryKey().notNull(),
  
  // Relation to main invoice
  faktur_id: char('faktur_id', { length: 36 }).notNull().references(() => faktur.id),
  
  // Core invoice data (snapshot at the time of change)
  npwp_penjual: varchar('npwp_penjual', { length: 255 }),
  tanggal_faktur: date('tanggal_faktur').notNull(),
  jenis_faktur: varchar('jenis_faktur', { length: 50 }),
  kode_transaksi: char('kode_transaksi', { length: 2 }),
  referensi: varchar('referensi', { length: 255 }),
  npwp_nik_pembeli: varchar('npwp_nik_pembeli', { length: 255 }),
  nama_pembeli: varchar('nama_pembeli', { length: 255 }),
  
  // Invoice numbers tracking
  nomor_faktur_pajak: varchar('nomor_faktur_pajak', { length: 255 }).notNull(),
  nomor_faktur_pajak_sebelumnya: varchar('nomor_faktur_pajak_sebelumnya', { length: 255 }),
  nomor_faktur_pajak_asli: varchar('nomor_faktur_pajak_asli', { length: 255 }),
  
  // Financial data for tracking changes
  dpp_total: decimal('dpp_total', { precision: 20, scale: 2 }),
  ppn_total: decimal('ppn_total', { precision: 20, scale: 2 }),
  
  // Status information
  status_faktur_sebelumnya: mysqlEnum('status_faktur_sebelumnya', ['DRAFT', 'APPROVED', 'AMENDED', 'CANCELLED']),
  status_faktur: mysqlEnum('status_faktur', ['DRAFT', 'APPROVED', 'AMENDED', 'CANCELLED'])
    .notNull()
    .default('DRAFT'),
  
  // Amendment tracking
  nomor_amandemen: int('nomor_amandemen').default(0),
  tanggal_amandemen: date('tanggal_amandemen'),
  alasan_amandemen: varchar('alasan_amandemen', { length: 1000 }),
  
  // Coretax specific fields
  coretax_record_id: varchar('coretax_record_id', { length: 255 }),
  coretax_amended_record_id: varchar('coretax_amended_record_id', { length: 255 }),
  coretax_document_form_number: varchar('coretax_document_form_number', { length: 255 }),
  
  // Audit trail
  created_at: timestamp('created_at').notNull().defaultNow(),
  created_by: varchar('created_by', { length: 255 }),
  
  // Additional data
  keterangan: text('keterangan'),
  data_json: text('data_json'), // For storing additional data in JSON format
});

/**
 * Table to track changes to invoice details
 * This stores a full history of all changes to invoice detail items
 */
export const fakturDetailHistory = mysqlTable('T_L_EFW_TAX_FAKTUR_DETAIL_HISTORY', {
  // Primary key
  id: char('id', { length: 36 }).primaryKey().notNull(),
  
  // Relations
  faktur_history_id: char('faktur_history_id', { length: 36 }).notNull().references(() => fakturHistory.id),
  faktur_detail_id: char('faktur_detail_id', { length: 36 }),
  
  // Item details
  barang_or_jasa: varchar('barang_or_jasa', { length: 5 }),
  kode_barang_or_jasa: varchar('kode_barang_or_jasa', { length: 25 }),
  nama_barang_or_jasa: text('nama_barang_or_jasa'),
  nama_satuan_ukur: varchar('nama_satuan_ukur', { length: 255 }),
  
  // Financial data
  harga_satuan: decimal('harga_satuan', { precision: 20, scale: 2 }),
  harga_satuan_sebelumnya: decimal('harga_satuan_sebelumnya', { precision: 20, scale: 2 }),
  jumlah_barang: int('jumlah_barang'),
  jumlah_jasa: int('jumlah_jasa'),
  diskon_persen: decimal('diskon_persen', { precision: 5, scale: 2 }),
  dpp: decimal('dpp', { precision: 20, scale: 2 }),
  dpp_sebelumnya: decimal('dpp_sebelumnya', { precision: 20, scale: 2 }),
  tarif_ppn: decimal('tarif_ppn', { precision: 5, scale: 2 }),
  ppn: decimal('ppn', { precision: 20, scale: 2 }),
  ppn_sebelumnya: decimal('ppn_sebelumnya', { precision: 20, scale: 2 }),
  
  // Amendment tracking
  is_changed: boolean('is_changed').default(false),
  change_type: mysqlEnum('change_type', ['ADDED', 'MODIFIED', 'REMOVED', 'UNCHANGED']).default('UNCHANGED'),
  
  // Audit trail
  created_at: timestamp('created_at').notNull().defaultNow(),
  created_by: varchar('created_by', { length: 255 }),
});