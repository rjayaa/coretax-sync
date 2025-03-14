// src/lib/db/schema/invoice-history.ts
import { mysqlTable, char, varchar, date, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';
import { faktur } from './faktur';

/**
 * Table to track invoice amendment history
 * This allows keeping a history of all invoice numbers and their amendments
 */
export const invoiceHistory = mysqlTable('T_L_EFW_TAX_FAKTUR_HISTORY', {
  // Primary key
  id: char('id', { length: 36 }).primaryKey(),
  
  // Relation to main invoice
  faktur_id: char('faktur_id', { length: 36 }).notNull().references(() => faktur.id),
  
  // Invoice info
  nomor_faktur_pajak: varchar('nomor_faktur_pajak', { length: 255 }).notNull(),
  nomor_faktur_pajak_asli: varchar('nomor_faktur_pajak_asli', { length: 255 }),
  
  // Status info
  status_faktur: mysqlEnum('status_faktur', ['DRAFT', 'APPROVED', 'AMENDED', 'CANCELLED'])
    .notNull()
    .default('DRAFT'),
  
  // Date tracking
  tanggal_faktur: date('tanggal_faktur').notNull(),
  tanggal_amandemen: date('tanggal_amandemen'),
  
  // Audit trail
  created_at: timestamp('created_at').notNull().defaultNow(),
  created_by: varchar('created_by', { length: 255 }),
  
  // Notes about the amendment
  keterangan: varchar('keterangan', { length: 1000 }),
});