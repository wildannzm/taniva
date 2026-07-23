import { apiFetch } from './client.js';

/**
 * Submit UMKM rating for a farmer
 * @param {string} order_id 
 * @param {number} nilai 
 * @param {string} catatan 
 * @param {AbortSignal} [signal]
 */
export async function submitRating(order_id, nilai, catatan, signal) {
	return apiFetch('/api/feedback/rating', {
		method: 'POST',
		body: { order_id, nilai, catatan },
		signal
	});
}
