// src/lib/db/schema/faktur.ts
import { varchar, date, mysqlTable, char,mysqlEnum } from 'drizzle-orm/mysql-core';


export const faktur = mysqlTable('T_L_EFW_TAX_FAKTUR_MASTER', {
  id: varchar('id', { length: 36 }).primaryKey(),
  npwp_penjual: varchar('npwp_penjual', { length: 255 }),
  tanggal_faktur: date('tanggal_faktur').notNull(),
  jenis_faktur: varchar('jenis_faktur', { length: 50 }).default('Normal'),
  kode_transaksi: char('kode_transaksi', { length: 2 }).notNull(),
  keterangan_tambahan: varchar('keterangan_tambahan', { length: 20 }),
  dokumen_pendukung: varchar('dokumen_pendukung', { length: 255 }),
  referensi: varchar('referensi', { length: 255 }),
  cap_fasilitas: varchar('cap_fasilitas', { length: 255 }),
  id_tku_penjual: varchar('id_tku_penjual', { length: 255 }).notNull(),
  npwp_nik_pembeli: varchar('npwp_nik_pembeli', { length: 255 }).notNull(),
  jenis_id_pembeli: varchar('jenis_id_pembeli', { length: 10 }).default('TIN'),
  negara_pembeli: char('negara_pembeli', { length: 3 }).default('IDN'),
  nomor_dokumen_pembeli: varchar('nomor_dokumen_pembeli', { length: 255 }),
  nama_pembeli: varchar('nama_pembeli', { length: 255 }).notNull(),
  alamat_pembeli: varchar('alamat_pembeli', { length: 255 }).notNull(),
  id_tku_pembeli: varchar('id_tku_pembeli', { length: 255 }).notNull(),
  nomor_faktur_pajak: varchar('nomor_faktur_pajak', { length: 255 }).default(''),  
  status_faktur: mysqlEnum('status_faktur', ['DRAFT', 'APPROVED', 'AMENDED', 'CANCELLED'])
    .notNull()
    .default('DRAFT'),
});