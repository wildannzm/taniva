import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchIntentFromOpenRouter, OpenRouterError } from './openrouter.service.js';

// ─── Reset config cache before each test ───────────────────────────────────────

// The config module caches on first call. We mock getConfig directly.
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

// ─── Helpers ────────────────────────────────────────────────────────────────────

function mockFetchResponse(body, status = 200) {
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	});
}

function validOpenRouterResponse(content) {
	return {
		choices: [
			{
				message: {
					content: typeof content === 'string' ? content : JSON.stringify(content)
				}
			}
		]
	};
}

const validIntent = {
	commodity: 'tomato',
	quantityKg: 20,
	minimumQuality: 80,
	neededDate: '2026-07-24'
};

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('fetchIntentFromOpenRouter', () => {
	let originalFetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it('returns content on successful response', async () => {
		globalThis.fetch = mockFetchResponse(validOpenRouterResponse(validIntent));

		const result = await fetchIntentFromOpenRouter('Saya butuh 20 kg tomat', '2026-07-23');

		expect(result).toBe(JSON.stringify(validIntent));
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);

		// Verify request structure
		const [url, options] = globalThis.fetch.mock.calls[0];
		expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer test-key');
		expect(options.headers['Content-Type']).toBe('application/json');

		const body = JSON.parse(options.body);
		expect(body.model).toBe('google/gemma-4-31b-it');
		expect(body.temperature).toBe(0);
		expect(body.stream).toBe(false);
		expect(body.response_format.type).toBe('json_schema');
	});

	it('throws EXTERNAL_TIMEOUT on AbortError', async () => {
		globalThis.fetch = vi
			.fn()
			.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

		await expect(fetchIntentFromOpenRouter('test', '2026-07-23')).rejects.toThrow(OpenRouterError);

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
		} catch (e) {
			expect(e.code).toBe('EXTERNAL_TIMEOUT');
			expect(e.status).toBe(504);
		}
	});

	it('throws NLP_SERVICE_ERROR on HTTP 401', async () => {
		globalThis.fetch = mockFetchResponse({}, 401);

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws NLP_SERVICE_ERROR on HTTP 429', async () => {
		globalThis.fetch = mockFetchResponse({}, 429);

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws NLP_SERVICE_ERROR on HTTP 500', async () => {
		globalThis.fetch = mockFetchResponse({}, 500);

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws NLP_SERVICE_ERROR when choices array is empty', async () => {
		globalThis.fetch = mockFetchResponse({ choices: [] });

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws NLP_SERVICE_ERROR when choices is missing', async () => {
		globalThis.fetch = mockFetchResponse({});

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws NLP_SERVICE_ERROR when message.content is null', async () => {
		globalThis.fetch = mockFetchResponse({
			choices: [{ message: { content: null } }]
		});

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('NLP_SERVICE_ERROR');
		}
	});

	it('throws INTERNAL_ERROR on unexpected error', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('network failure'));

		try {
			await fetchIntentFromOpenRouter('test', '2026-07-23');
			expect.unreachable('should have thrown');
		} catch (e) {
			expect(e).toBeInstanceOf(OpenRouterError);
			expect(e.code).toBe('INTERNAL_ERROR');
			expect(e.status).toBe(500);
		}
	});
});
