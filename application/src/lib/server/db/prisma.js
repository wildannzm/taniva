import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

/**
 * Singleton Prisma Client instance with pg adapter for PostgreSQL.
 * Server-only — do NOT import this file from browser/frontend code.
 */
const prisma =
	// @ts-ignore — globalThis singleton for dev hot-reload
	globalThis['__prisma'] ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	// @ts-ignore — globalThis singleton for dev hot-reload
	globalThis['__prisma'] = prisma;
}

export { prisma };
