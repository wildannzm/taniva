import { apiFetch } from './client.js';

/**
 * Check health status
 * @param {AbortSignal} [signal] 
 */
export async function checkHealth(signal) {
	return apiFetch('/api/health', { signal });
}
