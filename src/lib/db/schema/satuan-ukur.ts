import { varchar, date, mysqlTable, char } from 'drizzle-orm/mysql-core';

export const satuanUkur = mysqlTable('T_L_EFW_TAX_REF_SATUAN_UKUR', {
    id: varchar('id', { length: 10 }).primaryKey(),
    satuan: varchar('satuan', { length: 50 }).notNull(),

});