// src/lib/db/schema/detail-faktur.ts
import { char, varchar, mysqlTable, decimal, int, text } from 'drizzle-orm/mysql-core';
import { faktur } from './faktur';

export const fakturDetail = mysqlTable('T_L_EFW_TAX_FAKTUR_DETAIL_MASTER', {
  id_detail_faktur: char('id_detail_faktur', { length: 36 }).primaryKey(),
  id_faktur: char('id_faktur', { length: 36 }).notNull().references(() => faktur.id),
  barang_or_jasa: varchar('barang_or_jasa', { length: 5 }),
  kode_barang_or_jasa: varchar('kode_barang_or_jasa', { length: 25 }),
  nama_barang_or_jasa: text('nama_barang_or_jasa'),
  nama_satuan_ukur: varchar('nama_satuan_ukur', { length: 255 }).notNull(),
  harga_satuan: decimal('harga_satuan', { precision: 20, scale: 2 }).notNull(),
  jumlah_barang: int('jumlah_barang'),
  jumlah_jasa: int('jumlah_jasa'),
  diskon_persen: decimal('diskon_persen', { precision: 5, scale: 2 }),
  dpp: decimal('dpp', { precision: 20, scale: 2 }).notNull(),
  dpp_nilai_lain: decimal('dpp_nilai_lain', { precision: 20, scale: 2 }),
  tarif_ppn: decimal('tarif_ppn', { precision: 5, scale: 2 }).default('12.00'),
  ppn: decimal('ppn', { precision: 20, scale: 2 }).notNull(),
  tarif_ppnbm: decimal('tarif_ppnbm', { precision: 5, scale: 2 }),
  ppnbm: decimal('ppnbm', { precision: 20, scale: 2 }),
});