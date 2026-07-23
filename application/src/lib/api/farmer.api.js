import { apiFetch } from './client.js';

/**
 * Get farmer reputation
 * @param {string} farmer_id 
 * @param {AbortSignal} [signal]
 */
export async function getFarmerReputation(farmer_id, signal) {
	return apiFetch(`/api/farmer/${farmer_id}/reputation`, { signal });
}
