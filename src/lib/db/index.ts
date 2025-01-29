// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as eipSchema from './schema/eip';
import * as taxSchema from './schema/tax';

// Create connections for both databases
const eipConnection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'eip_staging',
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined
});

const taxConnection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'DB_Dept_Tax',
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined
});

// Initialize Drizzle with the connections
export const eipDb = drizzle(eipConnection, { schema: eipSchema, mode: 'default' });
export const taxDb = drizzle(taxConnection, { schema: taxSchema, mode: 'default' });