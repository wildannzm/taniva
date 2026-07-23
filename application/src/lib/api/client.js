// src/lib/api/client.js

/**
 * Base API Client Fetcher
 * Menangani request ke server dengan standar response envelope Taniva.
 */

const BASE_URL = ''; // Relative path, same-origin dengan SvelteKit server

/**
 * @typedef {Object} FetchOptions
 * @property {string} [method='GET']
 * @property {Object} [headers={}]
 * @property {any} [body]
 * @property {AbortSignal} [signal]
 * @property {boolean} [isMultipart=false]
 */

/**
 * Memetakan error fetch mentah (Network Error, CORS, dll) ke pesan user-friendly
 * tanpa mengekspos stack trace.
 * @param {Error} error
 * @returns {Error}
 */
function mapNetworkError(error) {
	if (error.name === 'AbortError') {
		return new Error('Permintaan dibatalkan.');
	}
	if (
		error.message.includes('Failed to fetch') ||
		error.message.includes('NetworkError') ||
		error.message.includes('fetch')
	) {
		return new Error('Koneksi terputus. Pastikan perangkat terhubung ke internet.');
	}
	return new Error('Terjadi kesalahan pada sistem. Silakan coba lagi nanti.');
}

/**
 * Fungsi inti untuk melakukan request API
 * @param {string} endpoint - Path endpoint (misal: '/api/health')
 * @param {FetchOptions} [options] - Konfigurasi fetch
 * @returns {Promise<{data: any, meta?: any, requestId: string|null, status: number}>}
 */
export async function apiFetch(endpoint, options = {}) {
	const { method = 'GET', headers = {}, body, signal, isMultipart = false } = options;

	/** @type {any} */
	const config = {
		method,
		headers: { ...headers },
		signal,
	};

	if (body) {
		if (isMultipart) {
			// Jika multipart (FormData), browser otomatis mengatur Content-Type beserta boundary
			config.body = body;
			delete config.headers['Content-Type'];
		} else {
			config.headers['Content-Type'] = 'application/json';
			config.body = JSON.stringify(body);
		}
	}

	/** @type {Response} */
	let response;
	try {
		// Mutasi (POST/PUT/PATCH/DELETE) TIDAK boleh di auto-retry untuk mencegah aksi ganda
		response = await fetch(`${BASE_URL}${endpoint}`, config);
	} catch (error) {
		// Pemetaan network error murni (fetch gagal total, bukan HTTP error)
		throw mapNetworkError(/** @type {Error} */ (error));
	}

	// Simpan Request ID dari header untuk tracking
	const requestId =
		response.headers.get('x-request-id') ||
		response.headers.get('x-ray-id') ||
		null;

	/** @type {any} */
	let data;
	try {
		data = await response.json();
	} catch (e) {
		// Menangani invalid JSON (misal 502 Bad Gateway berupa HTML)
		throw new Error('Respons dari server tidak valid (Format data tidak dikenali).');
	}

	// Validasi standard Envelope Taniva pada HTTP error
	if (!response.ok) {
		let errorMsg = data.error || data.message || 'Terjadi kesalahan saat memproses permintaan.';
		if (typeof errorMsg !== 'string') {
			errorMsg = errorMsg.message || JSON.stringify(errorMsg);
		}
		/** @type {any} */
		const errorObj = new Error(errorMsg);
		errorObj.status = response.status;
		errorObj.requestId = requestId;
		throw errorObj;
	}

	// Cek envelope { success: false } pada HTTP 200 (edge case)
	if (data && typeof data.success !== 'undefined' && !data.success) {
		/** @type {any} */
		const errorObj = new Error(data.error || 'Terjadi kesalahan');
		errorObj.requestId = requestId;
		throw errorObj;
	}

	return {
		data: data.data !== undefined ? data.data : data,
		meta: data.meta,
		requestId,
		status: response.status,
	};
}
