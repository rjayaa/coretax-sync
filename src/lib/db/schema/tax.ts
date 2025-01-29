// lib/db/schema/tax.ts
import { mysqlTable, varchar, boolean } from 'drizzle-orm/mysql-core';

export const taxMasterCompany = mysqlTable('T_L_EFW_TAX_MASTER_COMPANY', {
  id: varchar('id', { length: 36 }).primaryKey(),
  company_name: varchar('company_name', { length: 50 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull(),
  npwp_company: varchar('npwp_company', { length: 25 }),
  status: varchar('status', { length: 50 }).notNull()
});
  
export const taxUserRoles = mysqlTable('T_L_EFW_TAX_USER_ROLES', {
  id: varchar('id', { length: 36 }).primaryKey(),
  idnik: varchar('idnik', { length: 20 }).notNull(),
  company_code: varchar('company_code', { length: 50 }).notNull(),
  is_active: boolean('is_active').default(true)
});