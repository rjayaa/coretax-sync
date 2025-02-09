// src/lib/db/schema/detail-faktur.ts
import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  int, 
  decimal, 
  index, 
  unique 
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { faktur } from './faktur';


export const detailFaktur = mysqlTable('T_L_EFW_TAX_DETAIL_FAKTUR', {
  id: varchar('id', { length: 36 }).primaryKey(),
  fakturId: varchar('faktur_id', { length: 36 })
    .notNull()
    .references(() => faktur.id, { onDelete: 'cascade' }),
  nomorUrut: int('nomor_urut').notNull(),
  barangJasa: varchar('barang_jasa', { length: 1 }).notNull().default('B'),
  kodeBarangJasa: varchar('kode_barang_jasa', { length: 50 }).notNull(),
  namaBarangJasa: text('nama_barang_jasa').notNull(),
  namaSatuanUkur: varchar('nama_satuan_ukur', { length: 50 }).notNull(),
  hargaSatuan: decimal('harga_satuan', { precision: 20, scale: 2 }).notNull(),
  jumlah: decimal('jumlah', { precision: 20, scale: 2 }).notNull(),
  hargaTotal: decimal('harga_total', { precision: 20, scale: 2 }).notNull(),
  diskon: decimal('diskon', { precision: 20, scale: 2 }).default('0'),
  dpp: decimal('dpp', { precision: 20, scale: 2 }).notNull(),
  ppn: decimal('ppn', { precision: 20, scale: 2 }).notNull(),
  tarifPpnbm: decimal('tarif_ppnbm', { precision: 5, scale: 2 }).default('0'),
  ppnbm: decimal('ppnbm', { precision: 20, scale: 2 }).default('0'),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  fakturNomorUrutIdx: unique('uk_faktur_nomor_urut').on(
    table.fakturId,
    table.nomorUrut
  ),
  kodeBarangIdx: index('idx_detail_faktur_kode_barang').on(table.kodeBarangJasa),
  fakturIdx: index('idx_detail_faktur_faktur').on(table.fakturId),
}));

export const detailFakturRelations = relations(detailFaktur, ({ one }) => ({
  faktur: one(faktur, {
    fields: [detailFaktur.fakturId],
    references: [faktur.id],
  }),
}));

export type DetailFaktur = typeof detailFaktur.$inferSelect;
export type NewDetailFaktur = typeof detailFaktur.$inferInsert;