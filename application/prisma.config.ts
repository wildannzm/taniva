/// <reference types="node" />
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Construct the URL since dotenv doesn't expand variables natively
if (process.env.DATABASE_URL?.includes('${')) {
	process.env.DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

export default defineConfig({
	schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
	migrations: {
		path: path.join(import.meta.dirname, 'prisma', 'migrations')
	}
});
