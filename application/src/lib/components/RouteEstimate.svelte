<script>
	import { onMount, onDestroy } from 'svelte';
	let { estimate, onConfirm, onCancel } = $props();

	/** @type {HTMLElement} */
	let mapContainer;
	/** @type {any} */
	let map;

	onMount(async () => {
		// Import leaflet dynamically to avoid SSR issues
		// @ts-ignore
		const L = (await import('leaflet')).default;
		
		// Initialize map
		map = L.map(mapContainer, {
			zoomControl: false,
			attributionControl: false
		});

		// Use a clean map style
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; OpenStreetMap'
		}).addTo(map);

		// UMKM Location (Solo Raya)
		/** @type {[number, number]} */
		const umkmLoc = [-7.5666, 110.8283];
		// Mock Farmer Location (Solo Raya Outskirts)
		/** @type {[number, number]} */
		const farmerLoc = [-7.6050, 110.8550];

		// Define custom eye-catching icons
		const umkmIcon = L.divIcon({ html: '<div class="emoji-marker dest bounce">🍽️</div>', className: '', iconSize: [40, 40] });
		const farmerIcon = L.divIcon({ html: '<div class="emoji-marker src">🧑‍🌾</div>', className: '', iconSize: [40, 40] });

		L.marker(umkmLoc, { icon: umkmIcon }).addTo(map);
		L.marker(farmerLoc, { icon: farmerIcon }).addTo(map);

		// Fetch real route from OSRM to follow the actual roads
		try {
			const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${farmerLoc[1]},${farmerLoc[0]};${umkmLoc[1]},${umkmLoc[0]}?overview=full&geometries=geojson`);
			const data = await res.json();
			
			if (data.code === 'Ok' && data.routes.length > 0) {
				const coords = data.routes[0].geometry.coordinates.map((/** @type {number[]} */ c) => [c[1], c[0]]);
				
				// Add glowing background line
				L.polyline(coords, { color: '#4caf50', weight: 8, opacity: 0.3 }).addTo(map);
				// Add main route line
				const polyline = L.polyline(coords, { color: '#1b5e20', weight: 4, opacity: 1 }).addTo(map);
				
				map.fitBounds(polyline.getBounds(), { padding: [40, 40], animate: true, duration: 1 });
			} else {
				throw new Error('OSRM Failed');
			}
		} catch (e) {
			// Fallback to straight dashed line if OSRM is unreachable
			const polyline = L.polyline([farmerLoc, umkmLoc], { color: '#1b5e20', weight: 4, dashArray: '8, 8' }).addTo(map);
			map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
		}
	});

	onDestroy(() => {
		if (map) map.remove();
	});

	/** @param {number} amount */
	function formatCurrency(amount) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="route-card glass-card animate-scale-in">
	<div class="route-header">
		<div class="header-icon">📍</div>
		<div class="header-text">
			<h3 class="route-title">Detail Pengiriman</h3>
			<p class="route-desc">Rute optimal dan estimasi logistik transparan.</p>
		</div>
	</div>

	<!-- Leaflet Map Container with Eye-Catching Frame -->
	<div class="map-wrapper">
		<div class="map-container" bind:this={mapContainer}></div>
		<div class="map-overlay-gradient"></div>
	</div>

	<div class="route-stats">
		<div class="r-stat">
			<div class="r-icon-bg"><span class="r-icon">📏</span></div>
			<div class="r-info">
				<span class="r-label">Jarak</span>
				<span class="r-val">{estimate.jarak_km} km</span>
			</div>
		</div>
		<div class="r-stat">
			<div class="r-icon-bg"><span class="r-icon">⏱️</span></div>
			<div class="r-info">
				<span class="r-label">Waktu</span>
				<span class="r-val">~{estimate.estimasi_waktu_menit} mnt</span>
			</div>
		</div>
		<div class="r-stat">
			<div class="r-icon-bg"><span class="r-icon">💰</span></div>
			<div class="r-info">
				<span class="r-label">Biaya (est)</span>
				<span class="r-val text-primary">{formatCurrency(estimate.estimasi_biaya)}</span>
			</div>
		</div>
	</div>

	<div class="route-actions">
		<button class="btn-cancel" onclick={onCancel}>Batalkan</button>
		<button class="btn-confirm" onclick={onConfirm}>Pesan Sekarang <span class="arrow">→</span></button>
	</div>
</div>

<style>
	.glass-card {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 24px;
		padding: 2rem;
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
	}

	.route-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.header-icon {
		font-size: 2rem;
		background: #e8f5e9;
		width: 3.5rem;
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 16px;
		color: #1b5e20;
	}

	.route-title {
		margin: 0 0 0.25rem;
		font-size: 1.25rem;
		font-weight: 800;
		color: #111827;
	}

	.route-desc {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.map-wrapper {
		position: relative;
		border-radius: 20px;
		padding: 6px;
		background: linear-gradient(135deg, #a5d6a7 0%, #1b5e20 100%);
		margin-bottom: 2rem;
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.2);
	}

	.map-container {
		width: 100%;
		height: 300px;
		border-radius: 16px;
		z-index: 1; 
		background: #f4f4f0;
	}

	@media (min-width: 768px) {
		.map-container {
			height: 450px;
		}
	}
	
	.map-overlay-gradient {
		position: absolute;
		bottom: 6px;
		left: 6px;
		right: 6px;
		height: 40px;
		background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 100%);
		border-bottom-left-radius: 16px;
		border-bottom-right-radius: 16px;
		pointer-events: none;
		z-index: 2;
	}
	
	:global(.emoji-marker) {
		background: white;
		width: 40px !important;
		height: 40px !important;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8px 16px rgba(0,0,0,0.2);
		font-size: 20px;
		border: 3px solid #1b5e20;
		margin-left: -5px; /* Offset correction */
		margin-top: -5px;
	}
	
	:global(.emoji-marker.dest) {
		border-color: #f59e0b;
	}

	:global(.bounce) {
		animation: bounceMarker 2s infinite;
	}

	@keyframes bounceMarker {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}

	.route-stats {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 640px) {
		.route-stats {
			grid-template-columns: repeat(3, 1fr);
			gap: 1rem;
		}
	}

	.r-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.25rem 0.5rem;
		background: #f9fafb;
		border-radius: 16px;
		border: 1px solid #f3f4f6;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.r-stat:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
		background: white;
		border-color: #e5e7eb;
	}

	.r-icon-bg {
		background: #e8f5e9;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.r-icon {
		font-size: 1.25rem;
	}

	.r-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.r-label {
		font-size: 0.6875rem;
		color: #6b7280;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.r-val {
		font-size: 0.9375rem;
		font-weight: 800;
		color: #111827;
	}

	.text-primary { color: #1b5e20; }

	.route-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.route-actions {
			flex-direction: row;
			gap: 1rem;
		}
	}

	.btn-cancel {
		flex: 1;
		padding: 1rem;
		background: transparent;
		color: #4b5563;
		border: 2px solid #e5e7eb;
		border-radius: 100px;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.btn-confirm {
		flex: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
		color: white;
		border: none;
		border-radius: 100px;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.2);
	}

	.btn-confirm:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.3);
	}

	.btn-confirm .arrow {
		transition: transform 0.2s;
	}

	.btn-confirm:hover .arrow {
		transform: translateX(4px);
	}

	.animate-scale-in {
		animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
