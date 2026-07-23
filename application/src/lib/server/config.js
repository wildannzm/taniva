import { env } from '$env/dynamic/private';
import { z } from 'zod';

const openRouterConfigSchema = z.object({
	OPENROUTER_API_KEY: z.string().min(1),
	OPENROUTER_MODEL: z.string().min(1).default('google/gemma-4-31b-it'),
	OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
	NLP_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
	OPENROUTER_APP_NAME: z.string().default('Taniva'),
	PUBLIC_APP_URL: z.string().url().default('http://localhost:5173')
});

/** @type {import('zod').infer<typeof openRouterConfigSchema> | null} */
let configCache = null;

export function getConfig() {
	if (configCache) return configCache;

	const parsed = openRouterConfigSchema.safeParse({
		OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
		OPENROUTER_MODEL: env.OPENROUTER_MODEL,
		OPENROUTER_BASE_URL: env.OPENROUTER_BASE_URL,
		NLP_TIMEOUT_MS: env.NLP_TIMEOUT_MS,
		OPENROUTER_APP_NAME: env.OPENROUTER_APP_NAME,
		PUBLIC_APP_URL: env.PUBLIC_APP_URL
	});

	if (!parsed.success) {
		console.error('Invalid server configuration:', parsed.error.format());
		throw new Error('Invalid server configuration');
	}

	configCache = parsed.data;
	return configCache;
}
