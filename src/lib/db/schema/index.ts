import { sql } from 'drizzle-orm';
import { timestamp, varchar } from 'drizzle-orm/mysql-core';

export * from './master';
export * from './faktur';
export * from './detail-faktur';
export * from './references';

// Utility types for common patterns
export type TimestampColumns = {
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string;
  updatedBy: string | null;
};

export type WithTimestamps<T> = T & TimestampColumns;

// Helper function for creating timestamp columns
export const timestampColumns = {
  createdAt: timestamp('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  createdBy: varchar('created_by', { length: 20 }).notNull(),
  updatedBy: varchar('updated_by', { length: 20 })
};