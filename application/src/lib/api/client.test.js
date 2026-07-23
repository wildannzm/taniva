// src/lib/api/client.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from './client.js';

describe('apiFetch', () => {
	let originalFetch;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	function mockFetch(status, body, headers = {}) {
		const headersMap = new Map(Object.entries(headers));
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: status >= 200 && status < 300,
			status,
			headers: {
				get: (key) => headersMap.get(key.toLowerCase()) || null
			},
			json: () => Promise.resolve(body)
		});
	}

	// 1. Success envelope
	it('should parse success envelope and return data', async () => {
		mockFetch(200, { success: true, data: { id: 1, name: 'test' } }, { 'x-request-id': 'req-123' });

		const result = await apiFetch('/api/health');

		expect(result.data).toEqual({ id: 1, name: 'test' });
		expect(result.requestId).toBe('req-123');
		expect(result.status).toBe(200);
	});

	// 2. Error envelope
	it('should throw on error envelope with proper message', async () => {
		mockFetch(400, { success: false, error: 'Data tidak valid' }, { 'x-request-id': 'req-456' });

		try {
			await apiFetch('/api/orders');
			expect.fail('Should have thrown');
		} catch (err) {
			expect(err.message).toBe('Data tidak valid');
			expect(err.status).toBe(400);
			expect(err.requestId).toBe('req-456');
		}
	});

	// 3. Invalid JSON
	it('should throw user-friendly error on invalid JSON', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			headers: { get: () => null },
			json: () => Promise.reject(new SyntaxError('Unexpected token'))
		});

		try {
			await apiFetch('/api/health');
			expect.fail('Should have thrown');
		} catch (err) {
			expect(err.message).toContain('tidak valid');
		}
	});

	// 4. Network failure
	it('should map network error to friendly message', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

		try {
			await apiFetch('/api/health');
			expect.fail('Should have thrown');
		} catch (err) {
			expect(err.message).toContain('Koneksi terputus');
		}
	});

	// 5. RequestId from header
	it('should capture x-request-id from response headers', async () => {
		mockFetch(200, { success: true, data: {} }, { 'x-request-id': 'abc-def-ghi' });

		const result = await apiFetch('/api/health');
		expect(result.requestId).toBe('abc-def-ghi');
	});

	// 6. Multipart request
	it('should send FormData without Content-Type header for multipart', async () => {
		mockFetch(200, { success: true, data: { batch_id: 'BATCH-001' } });

		const formData = new FormData();
		formData.append('file', new Blob(['test']), 'test.jpg');

		await apiFetch('/api/harvest/upload', {
			method: 'POST',
			body: formData,
			isMultipart: true
		});

		const fetchCall = globalThis.fetch.mock.calls[0];
		const config = fetchCall[1];

		// Content-Type should NOT be set (browser sets it automatically with boundary)
		expect(config.headers['Content-Type']).toBeUndefined();
		expect(config.body).toBe(formData);
	});

	// 7. AbortSignal
	it('should map AbortError to friendly message', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue((() => {
			const err = new Error('The operation was aborted');
			err.name = 'AbortError';
			return err;
		})());

		try {
			const controller = new AbortController();
			await apiFetch('/api/health', { signal: controller.signal });
			expect.fail('Should have thrown');
		} catch (err) {
			expect(err.message).toContain('dibatalkan');
		}
	});

	// 8. No auto-retry for mutation
	it('should not auto-retry on POST failure (mutation safety)', async () => {
		let callCount = 0;
		globalThis.fetch = vi.fn().mockImplementation(() => {
			callCount++;
			return Promise.reject(new TypeError('Failed to fetch'));
		});

		try {
			await apiFetch('/api/orders', { method: 'POST', body: { test: true } });
		} catch {
			// Expected
		}

		expect(callCount).toBe(1);
	});
});
