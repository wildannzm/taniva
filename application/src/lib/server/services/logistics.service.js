import { getConfig } from '../config.js';

/**
 * Calculate distance using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Earth's radius in km
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

/**
 * Calculate MVP Cost
 * @param {number} distanceKm
 * @returns {number} Estimated cost in Rupiah
 */
function calculateCost(distanceKm) {
	const baseCost = 5000;
	const costPerKm = 2500;
	return Math.round(baseCost + distanceKm * costPerKm);
}

export const LogisticsService = {
	/**
	 * @param {{ latitude: number, longitude: number }} origin
	 * @param {{ latitude: number, longitude: number }} destination
	 */
	async calculateRoute(origin, destination) {
		const config = getConfig();

		// Helper to return Haversine fallback
		const getFallback = () => {
			let distanceKm = 0;
			if (origin.latitude != null && origin.longitude != null && destination.latitude != null && destination.longitude != null) {
				const distKm = calculateHaversineDistance(
					origin.latitude,
					origin.longitude,
					destination.latitude,
					destination.longitude
				);
				distanceKm = Math.round(distKm * 10) / 10;
			}

			const estimatedCost = calculateCost(distanceKm);

			return {
				origin,
				destination,
				distanceKm,
				durationMinutes: null,
				estimatedCost,
				routeSource: 'haversine',
				geometry: {
					type: 'LineString',
					coordinates: [
						[origin.longitude, origin.latitude],
						[destination.longitude, destination.latitude]
					]
				},
				warning: 'Estimasi jarak menggunakan garis lurus (Haversine) karena layanan rute utama sedang tidak tersedia.'
			};
		};

		if (!config.OPENROUTESERVICE_API_KEY) {
			return getFallback();
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), config.ORS_TIMEOUT_MS);

		try {
			const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: config.OPENROUTESERVICE_API_KEY
				},
				body: JSON.stringify({
					coordinates: [
						[origin.longitude, origin.latitude],
						[destination.longitude, destination.latitude]
					]
				}),
				signal: controller.signal
			});

			if (!response.ok) {
				console.warn(`ORS API failed with status: ${response.status}`);
				return getFallback();
			}

			const data = await response.json();

			if (!data.features || data.features.length === 0) {
				return getFallback();
			}

			const feature = data.features[0];
			const properties = feature.properties;
			
			// Summary contains distance in meters and duration in seconds
			const distanceMeters = properties.summary.distance;
			const durationSeconds = properties.summary.duration;

			const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
			const durationMinutes = Math.round(durationSeconds / 60);
			const estimatedCost = calculateCost(distanceKm);

			return {
				origin,
				destination,
				distanceKm,
				durationMinutes,
				estimatedCost,
				routeSource: 'openrouteservice',
				geometry: feature.geometry,
				warning: null
			};
		} catch (error) {
			console.error('ORS Route Error:', error);
			return getFallback();
		} finally {
			clearTimeout(timeout);
		}
	}
};
