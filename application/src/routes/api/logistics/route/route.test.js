import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server.js';
import * as configModule from '$lib/server/config.js';

// Mock config module to return predictable ORS configuration
vi.mock('$lib/server/config.js', () => {
	return {
		getConfig: vi.fn()
	};
});

describe('Logistics Route API', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		global.fetch = vi.fn();
	});

	it('returns 400 if coordinate is invalid', async () => {
		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: 900, longitude: 110.595 }, // invalid latitude
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(400);
		expect(json.success).toBe(false);
		expect(json.error.code).toBe('VALIDATION_ERROR');
	});

	it('uses ORS when api key is provided and fetch succeeds', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: 'test-api-key',
			ORS_TIMEOUT_MS: 5000
		});

		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => ({
				features: [
					{
						properties: {
							summary: {
								distance: 8400.5, // 8.4 km
								duration: 1320.1 // 22 minutes
							}
						},
						geometry: {
							type: 'LineString',
							coordinates: [[110.595, -7.52], [110.8167, -7.5666]]
						}
					}
				]
			})
		});

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.success).toBe(true);
		expect(json.data.routeSource).toBe('openrouteservice');
		expect(json.data.distanceKm).toBe(8.4);
		expect(json.data.durationMinutes).toBe(22);
		expect(json.data.geometry.type).toBe('LineString');
		// Cost calculation: 5000 + (8.4 * 2500) = 26000
		expect(json.data.estimatedCost).toBe(26000);
		expect(json.data.warning).toBe(null);
		
		// Assert no API key is leaked in response
		expect(JSON.stringify(json).includes('test-api-key')).toBe(false);
	});

	it('uses haversine fallback when ORS returns 500', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: 'test-api-key',
			ORS_TIMEOUT_MS: 5000
		});

		global.fetch.mockResolvedValue({
			ok: false,
			status: 500
		});

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.success).toBe(true);
		expect(json.data.routeSource).toBe('haversine');
		expect(json.data.durationMinutes).toBe(null);
		expect(json.data.warning).not.toBeNull();
		expect(json.data.geometry.type).toBe('LineString');
		// Geometry should be straight line
		expect(json.data.geometry.coordinates).toEqual([
			[110.595, -7.52],
			[110.8167, -7.5666]
		]);
	});

	it('uses haversine fallback when ORS times out or throws error', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: 'test-api-key',
			ORS_TIMEOUT_MS: 5000
		});

		global.fetch.mockRejectedValue(new Error('AbortError'));

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.success).toBe(true);
		expect(json.data.routeSource).toBe('haversine');
	});

	it('uses haversine fallback when ORS response has invalid geometry (no features)', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: 'test-api-key',
			ORS_TIMEOUT_MS: 5000
		});

		// Mock ORS returning something weird like HTML or missing features
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => ({})
		});

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.data.routeSource).toBe('haversine');
	});

	it('uses haversine fallback when api key is not set', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: '',
			ORS_TIMEOUT_MS: 5000
		});

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		expect(json.data.routeSource).toBe('haversine');
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('calculates cost rounding correctly for haversine', async () => {
		configModule.getConfig.mockReturnValue({
			OPENROUTESERVICE_API_KEY: '',
			ORS_TIMEOUT_MS: 5000
		});

		const req = new Request('http://localhost/api/logistics/route', {
			method: 'POST',
			body: JSON.stringify({
				origin: { latitude: -7.52, longitude: 110.595 },
				destination: { latitude: -7.5666, longitude: 110.8167 }
			})
		});

		const response = await POST({ request: req });
		const json = await response.json();

		expect(response.status).toBe(200);
		// With haversine formula:
		// Distance between [-7.52, 110.595] and [-7.5666, 110.8167] is roughly ~25km or something
		// We just verify it returns a finite number for cost
		expect(json.data.estimatedCost).toBeGreaterThan(5000);
		expect(Number.isInteger(json.data.estimatedCost)).toBe(true);
	});
});
