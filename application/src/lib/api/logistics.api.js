import { apiFetch } from './client.js';

/**
 * Get route estimate
 * @param {string} farmer_id 
 * @param {Object} umkm_lokasi 
 * @param {AbortSignal} [signal]
 */
export async function getRouteEstimate(farmer_id, umkm_lokasi, signal) {
	return apiFetch('/api/logistics/route', {
		method: 'POST',
		body: { farmer_id, umkm_lokasi },
		signal
	});
}
