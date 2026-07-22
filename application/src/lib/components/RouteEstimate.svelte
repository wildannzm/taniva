<script>
	let { estimate, onConfirm, onCancel } = $props();

	/** @param {number} amount */
	function formatCurrency(amount) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
	}
</script>

<div class="route-card card animate-slide-up">
	<div class="route-header">
		<h3 class="route-title">Estimasi Pengiriman</h3>
		<p class="route-desc">Rincian logistik dari lokasi petani ke UMKM Anda.</p>
	</div>

	<!-- Simple visual map mock -->
	<div class="map-mock">
		<div class="map-node node-start">🧑‍🌾</div>
		<div class="map-line">
			<div class="map-car">🚚</div>
		</div>
		<div class="map-node node-end">🍽️</div>
	</div>

	<div class="route-stats">
		<div class="r-stat">
			<span class="r-icon">📏</span>
			<div class="r-info">
				<span class="r-label">Jarak</span>
				<span class="r-val">{estimate.jarak_km} km</span>
			</div>
		</div>
		<div class="r-stat">
			<span class="r-icon">⏱️</span>
			<div class="r-info">
				<span class="r-label">Waktu</span>
				<span class="r-val">~{estimate.estimasi_waktu_menit} mnt</span>
			</div>
		</div>
		<div class="r-stat">
			<span class="r-icon">💰</span>
			<div class="r-info">
				<span class="r-label">Biaya (est)</span>
				<span class="r-val">{formatCurrency(estimate.estimasi_biaya)}</span>
			</div>
		</div>
	</div>

	<div class="route-actions">
		<button class="btn btn-ghost" onclick={onCancel}>Batal</button>
		<button class="btn btn-primary" onclick={onConfirm}>Pesan Sekarang</button>
	</div>
</div>

<style>
	.route-card {
		border-color: #2196f3;
	}

	.route-header {
		margin-bottom: 1.25rem;
	}

	.route-title {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.route-desc {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant);
	}

	.map-mock {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #e3f2fd;
		border-radius: var(--radius-sm);
		margin-bottom: 1.25rem;
		position: relative;
	}

	.map-node {
		width: 2.5rem;
		height: 2.5rem;
		background: white;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		z-index: 2;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.map-line {
		flex: 1;
		height: 2px;
		background: #90caf9;
		margin: 0 0.5rem;
		position: relative;
		display: flex;
		align-items: center;
	}

	.map-car {
		position: absolute;
		font-size: 1.25rem;
		animation: drive 3s ease-in-out infinite alternate;
	}

	@keyframes drive {
		0% { left: 0%; transform: scaleX(1); }
		49% { left: 85%; transform: scaleX(1); }
		50% { left: 85%; transform: scaleX(-1); }
		99% { left: 0%; transform: scaleX(-1); }
		100% { left: 0%; transform: scaleX(1); }
	}

	.route-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.r-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 0.75rem 0.5rem;
		background: var(--color-surface-container-low);
		border-radius: var(--radius-sm);
	}

	.r-icon {
		font-size: 1.25rem;
		margin-bottom: 0.25rem;
	}

	.r-info {
		display: flex;
		flex-direction: column;
	}

	.r-label {
		font-size: 0.625rem;
		color: var(--color-on-surface-variant);
		text-transform: uppercase;
		font-weight: 600;
	}

	.r-val {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--color-on-surface);
	}

	.route-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
</style>
