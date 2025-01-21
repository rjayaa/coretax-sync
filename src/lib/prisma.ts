import { PrismaClient } from '@prisma/client'

// Ini untuk mencegah multiple Prisma instances saat hot reload di development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Buat instance PrismaClient baru jika belum ada di global object
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Log semua query ke console
  })

// Simpan instance ke global object di development mode
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma