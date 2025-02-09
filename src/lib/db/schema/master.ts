import { mysqlTable, varchar, text, timestamp, datetime, boolean, int } from 'drizzle-orm/mysql-core';


// Master Barang
export const taxMasterBarang = mysqlTable('T_L_EFW_TAX_MASTER_BARANG', {
  id: varchar('id', { length: 36 }).primaryKey(),
  goods_services: text('goods_services').notNull(),
  section: text('section'),
  chapter: text('chapter'),
  group: text('group'),
  english: text('english'),
  bahasa: text('bahasa')
});

// Master Company
export const taxMasterCompany = mysqlTable('T_L_EFW_TAX_MASTER_COMPANY', {
  id: varchar('id', { length: 36 }).primaryKey(),
  company_name: varchar('company_name', { length: 50 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull().unique(),
  npwp_company: varchar('npwp_company', { length: 25 }),
  status: varchar('status', { length: 50 }).notNull()
});

// Master Customer
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
});

// Master Jasa
export const taxMasterJasa = mysqlTable('T_L_EFW_TAX_MASTER_JASA', {
  id: varchar('id', { length: 36 }).primaryKey(),
  goods_services: text('goods_services').notNull(),
  section: text('section'),
  chapter: text('chapter'),
  group: text('group'),
  english: text('english'),
  bahasa: text('bahasa')
});

// User Roles
export const taxUserRoles = mysqlTable('T_L_EFW_TAX_USER_ROLES', {
  id: varchar('id', { length: 36 }).primaryKey(),
  idnik: varchar('idnik', { length: 20 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull(),
  is_active: boolean('is_active').default(true)
});