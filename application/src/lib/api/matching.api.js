import { apiFetch } from './client.js';

/**
 * Search and match farmers
 * @param {Object} criteria 
 * @param {AbortSignal} [signal]
 */
export async function searchMatching(criteria, signal) {
	return apiFetch('/api/matching/search', {
		method: 'POST',
		body: criteria,
		signal
	});
}
