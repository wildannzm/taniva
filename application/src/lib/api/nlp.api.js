import { apiFetch } from './client.js';

/**
 * Extract intent from natural language
 * @param {string} text 
 * @param {AbortSignal} [signal]
 */
export async function extractIntent(text, signal) {
	return apiFetch('/api/nlp/extract-intent', {
		method: 'POST',
		body: { text },
		signal
	});
}
