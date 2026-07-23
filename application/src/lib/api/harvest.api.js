import { apiFetch } from './client.js';

/**
 * Upload harvest photo for grading
 * @param {Object} payload 
 * @param {File} payload.image 
 * @param {string} payload.commodity
 * @param {number} payload.quantityKg
 * @param {number} payload.pricePerKg
 * @param {string} [payload.availableDate]
 * @param {string} payload.farmerId
 * @param {number} [payload.latitude]
 * @param {number} [payload.longitude]
 * @param {AbortSignal} [signal]
 */
export async function uploadHarvest(payload, signal) {
	const formData = new FormData();
	formData.append('image', payload.image);
	formData.append('commodity', payload.commodity);
	formData.append('quantityKg', String(payload.quantityKg));
	formData.append('pricePerKg', String(payload.pricePerKg));
	formData.append('farmerId', payload.farmerId);
	
	if (payload.availableDate) formData.append('availableDate', payload.availableDate);
	if (payload.latitude !== undefined) formData.append('latitude', String(payload.latitude));
	if (payload.longitude !== undefined) formData.append('longitude', String(payload.longitude));

	return apiFetch('/api/harvest/upload', {
		method: 'POST',
		body: formData,
		isMultipart: true,
		signal
	});
}

/**
 * Verify harvest certificate via batch ID (from QR)
 * @param {string} batch_id 
 * @param {AbortSignal} [signal]
 */
export async function verifyHarvest(batch_id, signal) {
	return apiFetch(`/api/harvest/${batch_id}/verify`, { signal });
}

/**
 * Get harvest detail by batch ID
 * @param {string} batch_id 
 * @param {AbortSignal} [signal]
 */
export async function getHarvestDetail(batch_id, signal) {
	return apiFetch(`/api/harvest/${batch_id}`, { signal });
}
