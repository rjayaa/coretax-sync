import { 
  mysqlTable, 
  varchar, 
  datetime, 
  decimal, 
  text, 
  timestamp, 
  index, 
  unique 
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { detailFaktur } from './detail-faktur';
import { 
  refKodeTransaksi, 
  refKeteranganTambahan,
  refCapFasilitas,
  refJenisPembeli 
} from './references';

export const faktur = mysqlTable('T_L_EFW_TAX_FAKTUR', {
  id: varchar('id', { length: 36 }).primaryKey(),
  nomorFaktur: varchar('nomor_faktur', { length: 50 }).unique(),
  npwpPenjual: varchar('npwp_penjual', { length: 20 }).notNull(),
  tanggalFaktur: datetime('tanggal_faktur').notNull(),
  jenisFaktur: varchar('jenis_faktur', { length: 20 }).notNull().default('Normal'),
  kodeTransaksi: varchar('kode_transaksi', { length: 10 })
    .notNull()
    .references(() => refKodeTransaksi.kode),
  keteranganTambahanKode: varchar('keterangan_tambahan_kode', { length: 20 }),
  capFasilitasKode: varchar('cap_fasilitas_kode', { length: 20 }),
  nomorInvoice: varchar('nomor_invoice', { length: 50 }).notNull(),
  idTkuPenjual: varchar('id_tku_penjual', { length: 50 }),
  npwpPembeli: varchar('npwp_pembeli', { length: 20 }).notNull(),
  jenisIdPembeli: varchar('jenis_id_pembeli', { length: 20 })
    .notNull()
    .default('TIN')
    .references(() => refJenisPembeli.kode),
  namaPembeli: varchar('nama_pembeli', { length: 255 }).notNull(),
  alamatPembeli: text('alamat_pembeli').notNull(),
  emailPembeli: varchar('email_pembeli', { length: 255 }),
  idTkuPembeli: varchar('id_tku_pembeli', { length: 50 }),
  dppTotal: decimal('dpp_total', { precision: 20, scale: 2 }).notNull().default('0'),
  ppnTotal: decimal('ppn_total', { precision: 20, scale: 2 }).notNull().default('0'),
  ppnbmTotal: decimal('ppnbm_total', { precision: 20, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
}, (table) => ({
  tanggalIdx: index('idx_faktur_tanggal').on(table.tanggalFaktur),
  statusIdx: index('idx_faktur_status').on(table.status),
  npwpPenjualIdx: index('idx_faktur_npwp_penjual').on(table.npwpPenjual),
  npwpPembeliIdx: index('idx_faktur_npwp_pembeli').on(table.npwpPembeli),
  nomorInvoiceIdx: index('idx_faktur_nomor_invoice').on(table.nomorInvoice),
  keteranganTambahanIdx: index('idx_keterangan_tambahan').on(
    table.kodeTransaksi,
    table.keteranganTambahanKode
  ),
  capFasilitasIdx: index('idx_cap_fasilitas').on(
    table.kodeTransaksi,
    table.capFasilitasKode
  )
}));

export const fakturRelations = relations(faktur, ({ many, one }) => ({
  details: many(detailFaktur),
  kodeTransaksiRef: one(refKodeTransaksi, {
    fields: [faktur.kodeTransaksi],
    references: [refKodeTransaksi.kode],
  }),
  jenisIdPembeliRef: one(refJenisPembeli, {
    fields: [faktur.jenisIdPembeli],
    references: [refJenisPembeli.kode],
  }),
  keteranganTambahanRef: one(refKeteranganTambahan, {
    fields: [faktur.kodeTransaksi, faktur.keteranganTambahanKode],
    references: [refKeteranganTambahan.kodeTransaksi, refKeteranganTambahan.kode],
  }),
  capFasilitasRef: one(refCapFasilitas, {
    fields: [faktur.kodeTransaksi, faktur.capFasilitasKode],
    references: [refCapFasilitas.kodeTransaksi, refCapFasilitas.kode],
  }),
}));

export type Faktur = typeof faktur.$inferSelect;
export type NewFaktur = typeof faktur.$inferInsert;