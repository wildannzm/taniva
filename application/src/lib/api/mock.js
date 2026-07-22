// src/lib/api/mock.js

export const mockUploadResponse = {
	batch_id: "550e8400-e29b-41d4-a716-446655440000",
	skor_kualitas: 87.5,
	hash_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	qr_payload: "taniva://verify/550e8400-e29b-41d4-a716-446655440000",
	timestamp: new Date().toISOString()
};

export const mockVerifyResponse = {
	batch_id: "550e8400-e29b-41d4-a716-446655440000",
	valid: true,
	skor_kualitas: 87.5,
	komoditas: "tomat",
	farmer_nama: "Pak Slamet"
};

export const mockExtractIntentResponse = {
	komoditas: "tomat",
	kuantitas: 50,
	satuan: "kg",
	kualitas_minimum: 80,
	tenggat: new Date(Date.now() + 86400000).toISOString() // Tomorrow
};

export const mockSearchResponse = {
	results: [
		{
			farmer_id: "f1-uuid",
			farmer_nama: "Pak Slamet",
			batch_id: "550e8400-e29b-41d4-a716-446655440000",
			skor_total: 91.2,
			breakdown: {
				skor_kualitas: 92,
				skor_reputasi: 88,
				skor_logistik: 95
			},
			penjelasan_nlp: "Pak Slamet sangat cocok karena jaraknya dekat (3km) dan tomatnya segar (Grade A)."
		},
		{
			farmer_id: "f2-uuid",
			farmer_nama: "Bu Tani",
			batch_id: "b2-uuid",
			skor_total: 85.5,
			breakdown: {
				skor_kualitas: 85,
				skor_reputasi: 90,
				skor_logistik: 80
			},
			penjelasan_nlp: "Reputasi tinggi tapi jarak sedikit lebih jauh (12km)."
		}
	]
};

export const mockRouteResponse = {
	jarak_km: 12.4,
	estimasi_biaya: 25000,
	estimasi_waktu_menit: 30
};

export const mockRatingResponse = {
	success: true,
	skor_reputasi_baru: 92.1
};

export const mockReputationResponse = {
	farmer_id: "f1-uuid",
	skor_reputasi: 92.1
};

/**
 * Simulate network delay
 * @param {number} ms 
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
