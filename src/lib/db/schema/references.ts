import { mysqlTable, varchar, text, timestamp, unique, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// Referensi Kode Transaksi
export const refKodeTransaksi = mysqlTable('ref_kode_transaksi', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kode: varchar('kode', { length: 10 }).notNull().unique(),
  keterangan: text('keterangan').notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  kodeIdx: unique('uk_kode').on(table.kode),
}));

// Referensi Keterangan Tambahan
export const refKeteranganTambahan = mysqlTable('ref_keterangan_tambahan', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kode: varchar('kode', { length: 20 }).notNull(),
  keterangan: text('keterangan').notNull(),
  kodeTransaksi: varchar('kode_transaksi', { length: 10 })
    .notNull()
    .references(() => refKodeTransaksi.kode),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  kodeTransaksiKodeIdx: unique('uk_kode_transaksi_kode').on(
    table.kodeTransaksi,
    table.kode
  ),
  kodeTransaksiIdx: index('idx_ket_tambahan_kode_transaksi').on(table.kodeTransaksi),
}));

// Referensi Cap Fasilitas
export const refCapFasilitas = mysqlTable('ref_cap_fasilitas', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kode: varchar('kode', { length: 20 }).notNull(),
  keterangan: text('keterangan').notNull(),
  kodeTransaksi: varchar('kode_transaksi', { length: 10 })
    .notNull()
    .references(() => refKodeTransaksi.kode),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  kodeTransaksiKodeIdx: unique('uk_kode_transaksi_kode').on(
    table.kodeTransaksi,
    table.kode
  ),
  kodeTransaksiIdx: index('idx_cap_fasilitas_kode_transaksi').on(table.kodeTransaksi),
}));

// Referensi Jenis Pembeli
export const refJenisPembeli = mysqlTable('ref_jenis_pembeli', {
  id: varchar('id', { length: 36 }).primaryKey(),
  kode: varchar('kode', { length: 20 }).notNull().unique(),
  keterangan: text('keterangan').notNull(),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});