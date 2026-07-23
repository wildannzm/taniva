import { apiFetch } from './client.js';

/**
 * Create a new order
 * @param {Object} orderData 
 * @param {AbortSignal} [signal]
 */
export async function createOrder(orderData, signal) {
	return apiFetch('/api/orders', {
		method: 'POST',
		body: orderData,
		signal
	});
}

/**
 * Get an order by ID
 * @param {string} orderId 
 * @param {AbortSignal} [signal]
 */
export async function getOrder(orderId, signal) {
	return apiFetch(`/api/orders/${orderId}`, { signal });
}

/**
 * Select a matching option for an order
 * @param {string} orderId 
 * @param {Object} selectionData 
 * @param {AbortSignal} [signal]
 */
export async function selectOrderOption(orderId, selectionData, signal) {
	return apiFetch(`/api/orders/${orderId}/select`, {
		method: 'POST',
		body: selectionData,
		signal
	});
}
