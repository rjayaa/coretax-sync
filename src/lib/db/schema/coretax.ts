// src/lib/db/schema/coretax.ts
import { varchar, date, mysqlTable, boolean, timestamp, text } from 'drizzle-orm/mysql-core';
import { faktur } from './faktur';

export const coretaxData = mysqlTable('T_L_EFW_TAX_CORETAX_DATA', {
  // Primary identifiers
  record_id: varchar('record_id', { length: 36 }).primaryKey(), // RecordId dari Coretax
  aggregate_identifier: varchar('aggregate_identifier', { length: 36 }).notNull(),
  
  // Taxpayer information
  seller_taxpayer_aggregate_id: varchar('seller_taxpayer_aggregate_id', { length: 36 }),
  buyer_taxpayer_aggregate_id: varchar('buyer_taxpayer_aggregate_id', { length: 36 }),
  created_by_seller: boolean('created_by_seller').default(false),
  seller_tin: varchar('seller_tin', { length: 255 }),
  buyer_tin: varchar('buyer_tin', { length: 255 }),
  document_number: varchar('document_number', { length: 255 }),
  seller_taxpayer_name: varchar('seller_taxpayer_name', { length: 255 }),
  buyer_taxpayer_name: varchar('buyer_taxpayer_name', { length: 255 }),
  buyer_taxpayer_name_clear: varchar('buyer_taxpayer_name_clear', { length: 255 }),
  buyer_name: varchar('buyer_name', { length: 255 }),
  
  // Invoice information
  tax_invoice_code: varchar('tax_invoice_code', { length: 20 }),
  tax_invoice_number: varchar('tax_invoice_number', { length: 255 }),
  tax_invoice_date: timestamp('tax_invoice_date'),
  tax_invoice_period: varchar('tax_invoice_period', { length: 20 }),
  tax_invoice_year: varchar('tax_invoice_year', { length: 10 }),
  tax_invoice_status: varchar('tax_invoice_status', { length: 20 }),
  buyer_status: varchar('buyer_status', { length: 20 }),
  
  // Financial information
  selling_price: varchar('selling_price', { length: 50 }),
  other_tax_base: varchar('other_tax_base', { length: 50 }),
  vat: varchar('vat', { length: 50 }),
  stlg: varchar('stlg', { length: 50 }),
  
  // Relationship tracking
  signer: varchar('signer', { length: 255 }),
  downpayment_parent_identifier: varchar('downpayment_parent_identifier', { length: 36 }),
  downpayment_sum: varchar('downpayment_sum', { length: 50 }),
  amended_record_id: varchar('amended_record_id', { length: 36 }),
  
  // Status flags
  valid: boolean('valid').default(true),
  reported_by_buyer: boolean('reported_by_buyer').default(false),
  reported_by_seller: boolean('reported_by_seller').default(false),
  reported_by_vat_collector: boolean('reported_by_vat_collector').default(false),
  
  // Timestamps
  last_updated_date: timestamp('last_updated_date'),
  creation_date: timestamp('creation_date'),
  
  // Credit information
  period_credit: varchar('period_credit', { length: 20 }),
  year_credit: varchar('year_credit', { length: 10 }),
  input_invoice_status: varchar('input_invoice_status', { length: 20 }),
  
  // Document information
  document_form_number: varchar('document_form_number', { length: 255 }),
  document_form_aggregate_id: varchar('document_form_aggregate_id', { length: 36 }),
  e_sign_status: varchar('e_sign_status', { length: 20 }),
  amended_document_form_number: varchar('amended_document_form_number', { length: 255 }),
  amended_document_form_aggregate_id: varchar('amended_document_form_aggregate_id', { length: 36 }),
  
  // Additional flags and references
  is_show_cancel_in_grid: boolean('is_show_cancel_in_grid').default(false),
  reference: varchar('reference', { length: 255 }),
  channel_code: varchar('channel_code', { length: 50 }),
  display_name: varchar('display_name', { length: 255 }),
  is_migrated: boolean('is_migrated').default(false),
  
  // Track synchronization
  sync_date: timestamp('sync_date').defaultNow(),
  
  // Link to our faktur table
  local_faktur_id: varchar('local_faktur_id', { length: 36 }).references(() => faktur.id),
});