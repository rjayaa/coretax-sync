import { mysqlTable, varchar, int, datetime, boolean } from 'drizzle-orm/mysql-core';
export const userLoginView = mysqlTable('V_L_FAT_USER_LOGIN', {
    idlogin: int('idlogin'),
    idnik: varchar('idnik', { length: 20 }),
    username: varchar('username', { length: 255 }),
    password: varchar('password', { length: 255 }),
    position: varchar('position', { length: 255 }),
    status_login: varchar('status_login', { length: 255 }),
    last_active: datetime('last_active'),
    date_upload: datetime('date_upload'),
    token_jwt: varchar('token_jwt', { length: 255 }),
    refresh_token: varchar('refresh_token', { length: 255 }),
    updatedAt: datetime('updatedAt')
  });