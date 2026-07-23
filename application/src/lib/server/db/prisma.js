import { PrismaClient } from '../../../generated/prisma/client';
import 'dotenv/config';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set');
}

/**
 * Singleton Prisma Client instance for MySQL.
 * Server-only — do NOT import this file from browser/frontend code.
 */
const prisma =
	// @ts-ignore — globalThis singleton for dev hot-reload
	globalThis['__prisma'] ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
	// @ts-ignore — globalThis singleton for dev hot-reload
	globalThis['__prisma'] = prisma;
}

export { prisma };
