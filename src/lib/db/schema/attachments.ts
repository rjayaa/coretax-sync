import { varchar, timestamp, int, mysqlTable } from 'drizzle-orm/mysql-core';
import { faktur } from './faktur';

export const fakturAttachments = mysqlTable('T_L_FAKTUR_ATTACHMENTS', {
  id: varchar('id', { length: 36 }).primaryKey(),
  faktur_id: varchar('faktur_id', { length: 36 }).notNull().references(() => faktur.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  original_filename: varchar('original_filename', { length: 255 }).notNull(),
  file_path: varchar('file_path', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 100 }).notNull(),
  file_size: int('file_size').notNull(),
  uploaded_by: varchar('uploaded_by', { length: 100 }),
  uploaded_at: timestamp('uploaded_at').defaultNow(),
  description: varchar('description', { length: 255 }),
});