// lib/db/schema/tax.ts
import { mysqlTable, varchar, text, decimal, timestamp, datetime, boolean, int } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const taxMasterBarang = mysqlTable('T_L_EFW_TAX_MASTER_BARANG', {
  id: varchar('id', { length: 36 }).primaryKey(),
  goods_services: text('goods_services').notNull(),
  section: text('section'),
  chapter: text('chapter'),
  group: text('group'),
  english: text('english'),
  bahasa: text('bahasa')
})

export const taxMasterCompany = mysqlTable('T_L_EFW_TAX_MASTER_COMPANY', {
  id: varchar('id', { length: 36 }).primaryKey(),
  company_name: varchar('company_name', { length: 50 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull().unique(),
  npwp_company: varchar('npwp_company', { length: 25 }),
  status: varchar('status', { length: 50 }).notNull()
})

export const taxMasterCustomer = mysqlTable('T_L_EFW_TAX_MASTER_CUSTOMER', {
  id: varchar('id', { length: 36 }).primaryKey(),
  no: varchar('no', { length: 50 }).notNull(),
  npwp: varchar('npwp', { length: 25 }).notNull(),
  nama: text('nama').notNull(),
  jalan: text('jalan'),
  blok: text('blok'),
  nomor: text('nomor'),
  rt: varchar('rt', { length: 3 }),
  rw: varchar('rw', { length: 3 }),
  kecamatan: text('kecamatan'),
  kelurahan: text('kelurahan'),
  kabupaten: text('kabupaten'),
  propinsi: text('propinsi'),
  kode_pos: varchar('kode_pos', { length: 10 }),
  nomor_telepon: text('nomor_telepon')
})

export const taxMasterJasa = mysqlTable('T_L_EFW_TAX_MASTER_JASA', {
  id: varchar('id', { length: 36 }).primaryKey(),
  goods_services: text('goods_services').notNull(),
  section: text('section'),
  chapter: text('chapter'),
  group: text('group'),
  english: text('english'),
  bahasa: text('bahasa')
})

export const taxInvoiceHeader = mysqlTable('T_L_EFW_TAX_INVOICE_HEADER', {
  id: varchar('id', { length: 36 }).primaryKey(),
  customer_id: varchar('customer_id', { length: 36 }).notNull(),
  company_id: varchar('company_id', { length: 36 }).notNull(),
  transaction_type: varchar('transaction_type', { length: 20 }).notNull(),
  invoice_date: datetime('invoice_date').notNull(),
  invoice_type: varchar('invoice_type', { length: 50 }).notNull().default('Normal'),
  transaction_code: varchar('transaction_code', { length: 50 }).notNull(),
  additional_info: text('additional_info'),
  supporting_doc: text('supporting_doc'),
  reference: varchar('reference', { length: 100 }),
  facility_stamp: varchar('facility_stamp', { length: 100 }),
  seller_idtku: varchar('seller_idtku', { length: 50 }),
  buyer_doc_type: varchar('buyer_doc_type', { length: 50 }).default('TIN'),
  buyer_country: varchar('buyer_country', { length: 3 }).default('IDN'),
  buyer_doc_number: varchar('buyer_doc_number', { length: 50 }),
  buyer_email: varchar('buyer_email', { length: 255 }),
  buyer_idtku: varchar('buyer_idtku', { length: 50 }),
  notes: text('notes'),
  ctrl: varchar('ctrl', { length: 50 }),
  reference_dp_invoice: varchar('reference_dp_invoice', { length: 100 }),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar('created_by', { length: 20 }).notNull(),
  updated_at: timestamp('updated_at').onUpdateNow(),
  updated_by: varchar('updated_by', { length: 20 })
})

export const taxInvoiceStatus = mysqlTable('T_L_EFW_TAX_INVOICE_STATUS', {
  id: varchar('id', { length: 36 }).primaryKey(),
  invoice_id: varchar('invoice_id', { length: 36 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar('created_by', { length: 20 }).notNull()
})

export const taxUserRoles = mysqlTable('T_L_EFW_TAX_USER_ROLES', {
  id: varchar('id', { length: 36 }).primaryKey(),
  idnik: varchar('idnik', { length: 20 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull(),
  is_active: boolean('is_active').default(true)
})

export const taxInvoiceDetail = mysqlTable('T_L_EFW_TAX_INVOICE_DETAIL', {
  id: varchar('id', { length: 36 }).primaryKey(),
  invoice_id: varchar('invoice_id', { length: 36 }).notNull(),
  item_type: varchar('item_type', { length: 10 }).notNull(),
  goods_id: varchar('goods_id', { length: 36 }),
  service_id: varchar('service_id', { length: 36 }),
  item_name: varchar('item_name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  unit_price: decimal('unit_price', { precision: 20, scale: 2 }).notNull(),
  quantity: decimal('quantity', { precision: 20, scale: 2 }).notNull(),
  total_price: decimal('total_price', { precision: 20, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 20, scale: 2 }).default('0.00'),
  down_payment: decimal('down_payment', { precision: 20, scale: 2 }).default('0.00'),
  dpp: decimal('dpp', { precision: 20, scale: 2 }).notNull(),
  dpp_other: decimal('dpp_other', { precision: 20, scale: 2 }).notNull(),
  ppn_rate: decimal('ppn_rate', { precision: 5, scale: 2 }).default('12.00'),
  ppn: decimal('ppn', { precision: 20, scale: 2 }).notNull(),
  ppnbm_rate: decimal('ppnbm_rate', { precision: 5, scale: 2 }).default('10.00'),
  ppnbm: decimal('ppnbm', { precision: 20, scale: 2 }).notNull(),
  created_at: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  created_by: varchar('created_by', { length: 20 }).notNull(),
  updated_at: timestamp('updated_at').onUpdateNow(),
  updated_by: varchar('updated_by', { length: 20 })
})