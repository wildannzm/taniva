// src/lib/api/client.js
import {
	mockUploadResponse,
	mockVerifyResponse,
	mockExtractIntentResponse,
	mockSearchResponse,
	mockRouteResponse,
	mockRatingResponse,
	mockReputationResponse,
	delay
} from './mock.js';

// Toggle this to false when connecting to real backend
const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Upload harvest photo for grading
 * @param {File} file 
 * @param {string} farmer_id 
 */
export async function uploadHarvest(file, farmer_id) {
	if (USE_MOCK) {
		await delay(2500); // simulate CV processing
		return mockUploadResponse;
	}
	
	const formData = new FormData();
	formData.append('file', file);
	formData.append('farmer_id', farmer_id);

	const res = await fetch(`${BASE_URL}/api/harvest/upload`, {
		method: 'POST',
		body: formData
	});
	if (!res.ok) throw new Error('Gagal mengupload foto panen');
	return res.json();
}

/**
 * Verify harvest certificate via batch ID (from QR)
 * @param {string} batch_id 
 */
export async function verifyHarvest(batch_id) {
	if (USE_MOCK) {
		await delay(1000);
		return mockVerifyResponse;
	}

	const res = await fetch(`${BASE_URL}/api/harvest/${batch_id}/verify`);
	if (!res.ok) throw new Error('Gagal memverifikasi sertifikat');
	return res.json();
}

/**
 * Extract intent from natural language
 * @param {string} text 
 */
export async function extractIntent(text) {
	if (USE_MOCK) {
		await delay(3000); // simulate NLP processing
		return mockExtractIntentResponse;
	}

	const res = await fetch(`${BASE_URL}/api/nlp/extract-intent`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text })
	});
	if (!res.ok) throw new Error('Gagal memproses permintaan AI');
	return res.json();
}

/**
 * Search and match farmers
 * @param {Object} criteria 
 */
export async function searchMatching(criteria) {
	if (USE_MOCK) {
		await delay(1500);
		return mockSearchResponse;
	}

	const res = await fetch(`${BASE_URL}/api/matching/search`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(criteria)
	});
	if (!res.ok) throw new Error('Gagal mencari petani');
	return res.json();
}

/**
 * Get route estimate
 * @param {string} farmer_id 
 * @param {Object} umkm_lokasi 
 */
export async function getRouteEstimate(farmer_id, umkm_lokasi) {
	if (USE_MOCK) {
		await delay(800);
		return mockRouteResponse;
	}

	const res = await fetch(`${BASE_URL}/api/logistics/route`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ farmer_id, umkm_lokasi })
	});
	if (!res.ok) throw new Error('Gagal menghitung rute');
	return res.json();
}

/**
 * Submit UMKM rating for a farmer
 * @param {string} order_id 
 * @param {number} nilai 
 * @param {string} catatan 
 */
export async function submitRating(order_id, nilai, catatan) {
	if (USE_MOCK) {
		await delay(1200);
		return mockRatingResponse;
	}

	const res = await fetch(`${BASE_URL}/api/feedback/rating`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ order_id, nilai, catatan })
	});
	if (!res.ok) throw new Error('Gagal mengirim ulasan');
	return res.json();
}

/**
 * Get farmer reputation
 * @param {string} farmer_id 
 */
export async function getFarmerReputation(farmer_id) {
	if (USE_MOCK) {
		await delay(800);
		return mockReputationResponse;
	}

	const res = await fetch(`${BASE_URL}/api/farmer/${farmer_id}/reputation`);
	if (!res.ok) throw new Error('Gagal mengambil reputasi');
	return res.json();
}
