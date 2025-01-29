// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as eipSchema from './schema/eip';
import * as taxSchema from './schema/tax';

// Create a connection pool instead of single connections
const eipPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'eip_staging',
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const taxPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'DB_Dept_Tax',
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Drizzle with the connection pools
export const eipDb = drizzle(eipPool, { schema: eipSchema, mode: 'default' });
export const taxDb = drizzle(taxPool, { schema: taxSchema, mode: 'default' });