// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as eipSchema from './schema/eip';
import * as masterSchema from './schema/master';
import * as fakturSchema from './schema/faktur';
import * as detailSchema from './schema/detail-faktur';
import * as refSchema from './schema/references';

// Create connectiindeon pool for EIP database (Authentication)
const eipPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_EIP,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create connection pool for Tax database
const taxPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_TAX,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Drizzle with the connection pools
export const eipDb = drizzle(eipPool, { 
  schema: eipSchema,
  mode: 'default' 
});

export const db = drizzle(taxPool, { 
  schema: {
    ...masterSchema,
    ...fakturSchema,
    ...detailSchema,
    ...refSchema
  }, 
  mode: 'default' 
});

// Export schemas
export * from './schema/eip';
export * from './schema/master';
export * from './schema/faktur';
export * from './schema/detail-faktur';
export * from './schema/references';
export * from './schema/index';