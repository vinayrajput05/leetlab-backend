import { PrismaClient } from '../generated/prisma/index.js'

// Create a global reference to avoid creating multiple PrismaClient instances in development
const globalForPrisma = globalThis;

// Reuse the existing PrismaClient instance if it exists, or create a new one
export const db = globalForPrisma.prisma ?? new PrismaClient();

// In development mode, store the PrismaClient instance globally
// to prevent hot-reloading from creating new instances on every save
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
