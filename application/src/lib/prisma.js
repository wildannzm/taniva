import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

export const prisma = globalThis.__prisma || new PrismaClient({
	datasources: {
		db: {
			url: env.DATABASE_URL
		}
	}
});

if (process.env.NODE_ENV !== 'production') {
	globalThis.__prisma = prisma;
}
