import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterError } from './openrouter.service.js';

// ─── Mock dependencies ─────────────────────────────────────────────────────────

vi.mock('../config.js', () => ({
	getConfig: () => ({
		OPENROUTER_API_KEY: 'test-key',
		OPENROUTER_MODEL: 'google/gemma-4-31b-it',
		OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
		NLP_TIMEOUT_MS: 5000,
		OPENROUTER_APP_NAME: 'Taniva',
		PUBLIC_APP_URL: 'http://localhost:5173'
	})
}));

const validIntent = {
	commodity: 'tomato',
	quantityKg: 20,
	minimumQuality: 80,
	neededDate: '2026-07-24'
};

// We need to dynamically import after mocking
let extractIntent;

beforeEach(async () => {
	vi.resetModules();
});

describe('extractIntent', () => {
	it('returns structured result on success', async () => {
		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi.fn().mockResolvedValue(JSON.stringify(validIntent)),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');
		extractIntent = mod.extractIntent;

		const result = await extractIntent('Saya butuh 20 kg tomat kualitas bagus untuk besok');

		expect(result.rawText).toBe('Saya butuh 20 kg tomat kualitas bagus untuk besok');
		expect(result.intent).toEqual(validIntent);
		expect(result.requiresConfirmation).toBe(true);
		expect(result.meta.source).toBe('openrouter-gemma-4');
		expect(result.meta.model).toBe('google/gemma-4-31b-it');
		expect(result.meta.fallbackUsed).toBe(false);
		expect(typeof result.meta.durationMs).toBe('number');
	});

	it('cleans code fence from response', async () => {
		const fencedContent = '```json\n' + JSON.stringify(validIntent) + '\n```';

		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi.fn().mockResolvedValue(fencedContent),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');
		const result = await mod.extractIntent('test input');

		expect(result.intent).toEqual(validIntent);
	});

	it('throws NLP_SERVICE_ERROR when JSON is invalid', async () => {
		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi.fn().mockResolvedValue('not json at all'),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');

		try {
			await mod.extractIntent('test input');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
			expect(e.status).toBe(502);
		}
	});

	it('throws NLP_SERVICE_ERROR when intent fails Zod validation', async () => {
		const badIntent = { ...validIntent, commodity: 'potato' };

		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi.fn().mockResolvedValue(JSON.stringify(badIntent)),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');

		try {
			await mod.extractIntent('test input');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
			expect(e.status).toBe(502);
		}
	});

	it('propagates OpenRouterError from adapter', async () => {
		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi
				.fn()
				.mockRejectedValue(new OpenRouterError('Timed out', 'EXTERNAL_TIMEOUT', 504)),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');

		try {
			await mod.extractIntent('test input');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('EXTERNAL_TIMEOUT');
			expect(e.status).toBe(504);
		}
	});

	it('wraps unexpected errors as INTERNAL_ERROR', async () => {
		vi.doMock('./openrouter.service.js', () => ({
			fetchIntentFromOpenRouter: vi.fn().mockRejectedValue(new TypeError('oops')),
			OpenRouterError
		}));

		const mod = await import('./nlp.service.js');

		try {
			await mod.extractIntent('test input');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('INTERNAL_ERROR');
			expect(e.status).toBe(500);
		}
	});
});
