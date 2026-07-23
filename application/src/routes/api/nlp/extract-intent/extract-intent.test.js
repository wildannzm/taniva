import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Shared OpenRouterError class ───────────────────────────────────────────────

// We define a single class reference that both the endpoint and mock will use,
// avoiding instanceof mismatches from module resets.
class OpenRouterError extends Error {
	constructor(message, code, status) {
		super(message);
		this.name = 'OpenRouterError';
		this.code = code;
		this.status = status;
	}
}

// ─── Mock dependencies ─────────────────────────────────────────────────────────

vi.mock('$lib/server/config.js', () => ({
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

const successResult = {
	rawText: 'Saya butuh 20 kg tomat kualitas bagus',
	status: 'complete',
	intent: validIntent,
	requiresConfirmation: true,
	meta: {
		source: 'openrouter-gemma-4',
		model: 'google/gemma-4-31b-it',
		fallbackUsed: false,
		durationMs: 100
	}
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Simulate calling the POST handler with a JSON body.
 */
async function callPOST(handler, body) {
	const request = new Request('http://localhost/api/nlp/extract-intent', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});

	const response = await handler({ request });
	const data = await response.json();
	return { status: response.status, body: data };
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('POST /api/nlp/extract-intent', () => {
	let POST;

	beforeEach(async () => {
		vi.resetModules();
	});

	it('returns 200 with success envelope on valid input', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi.fn().mockResolvedValue(successResult)
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, {
			text: 'Saya butuh 20 kg tomat kualitas bagus'
		});

		expect(status).toBe(200);
		expect(body.success).toBe(true);
		expect(body.data.rawText).toBe('Saya butuh 20 kg tomat kualitas bagus');
		expect(body.data.intent).toEqual(validIntent);
		expect(body.data.requiresConfirmation).toBe(true);
		expect(body.meta.source).toBe('openrouter-gemma-4');
		expect(body.meta.model).toBe('google/gemma-4-31b-it');
	});

	it('returns 400 on invalid request body', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi.fn()
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, { text: '' });

		expect(status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('VALIDATION_ERROR');
	});

	it('returns 400 on missing text field', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi.fn()
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, {});

		expect(status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('VALIDATION_ERROR');
	});

	it('returns 502 on NLP_SERVICE_ERROR', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi
				.fn()
				.mockRejectedValue(new OpenRouterError('Provider error', 'NLP_SERVICE_ERROR', 502))
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, { text: 'butuh tomat 10 kg' });

		expect(status).toBe(502);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('NLP_SERVICE_ERROR');
	});

	it('returns 504 on EXTERNAL_TIMEOUT', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi
				.fn()
				.mockRejectedValue(new OpenRouterError('Timeout', 'EXTERNAL_TIMEOUT', 504))
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, { text: 'butuh tomat 10 kg' });

		expect(status).toBe(504);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('EXTERNAL_TIMEOUT');
	});

	it('returns 500 on unexpected error', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi.fn().mockRejectedValue(new Error('unexpected'))
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const { status, body } = await callPOST(POST, { text: 'butuh tomat 10 kg' });

		expect(status).toBe(500);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('INTERNAL_ERROR');
	});

	it('returns 400 on malformed JSON', async () => {
		vi.doMock('$lib/server/services/openrouter.service.js', () => ({ OpenRouterError }));
		vi.doMock('$lib/server/services/nlp.service.js', () => ({
			extractIntent: vi.fn()
		}));

		const mod = await import('./+server.js');
		POST = mod.POST;

		const request = new Request('http://localhost/api/nlp/extract-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'not json'
		});

		const response = await POST({ request });
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.error.code).toBe('VALIDATION_ERROR');
	});
});
