<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	
	let recentOrders = $state([
		{ id: 'ORD-001', date: 'Hari ini, 09:00', farmer: 'Pak Slamet', weight: '50 kg', status: 'pending' },
		{ id: 'ORD-002', date: 'Kemarin, 10:30', farmer: 'Bu Tani', weight: '20 kg', status: 'completed' },
		{ id: 'ORD-003', date: '11 Jun 2026', farmer: 'Pak Budi', weight: '100 kg', status: 'completed' }
	]);

	onMount(() => {
		userRole.set('umkm');
	});
</script>

<div class="page-wrapper">
	<!-- Background decorations -->
	<div class="bg-blob blob-1"></div>
	<div class="bg-blob blob-2"></div>

	<div class="dashboard-container animate-fade-in">
	<header class="dashboard-header">
		<div>
			<h1 class="page-title">Dashboard UMKM</h1>
			<p class="page-subtitle">Penuhi pasokan tomat berkualitas dengan AI.</p>
		</div>
		<div class="status-badge">
			<span class="indicator"></span>
			<span class="label">Sistem Aktif</span>
		</div>
	</header>

	<div class="main-grid">
		<!-- Quick Actions -->
		<section class="section-card actions-section">
			<h2 class="section-title">Aksi Cepat</h2>
			<div class="action-grid">
				<a href="/umkm/permintaan" class="action-card primary-action">
					<div class="action-icon">🎤</div>
					<div class="action-content">
						<h3 class="action-title">Cari Petani (Pesan Pintar)</h3>
						<p class="action-desc">Pesan bahan baku dengan bahasa natural (AI NLP)</p>
					</div>
					<div class="action-arrow">→</div>
				</a>
				
				<a href="/umkm/scan" class="action-card secondary-action">
					<div class="action-icon">📦</div>
					<div class="action-content">
						<h3 class="action-title">Terima Barang (Scan QR)</h3>
						<p class="action-desc">Verifikasi dan beri penilaian panen</p>
					</div>
					<div class="action-arrow">→</div>
				</a>
			</div>
		</section>

		<!-- Statistics -->
		<section class="section-card stats-section">
			<h2 class="section-title">Ringkasan Operasional</h2>
			<div class="stats-grid">
				<div class="stat-box">
					<div class="stat-value">12 <span class="unit">pesanan</span></div>
					<div class="stat-label">Bulan Ini</div>
				</div>
				<div class="stat-box">
					<div class="stat-value">850 <span class="unit">kg</span></div>
					<div class="stat-label">Total Volume</div>
				</div>
				<div class="stat-box full-width">
					<div class="stat-value text-green">94%</div>
					<div class="stat-label">Tingkat Kepuasan Petani Minta</div>
				</div>
			</div>
		</section>

		<!-- Recent Activity -->
		<section class="section-card history-section">
			<h2 class="section-title">Pesanan Terakhir</h2>
			<div class="history-list">
				{#each recentOrders as order}
					<div class="history-item">
						<div class="history-icon {order.status}">
							{order.status === 'completed' ? '✓' : '⏱'}
						</div>
						<div class="history-details">
							<div class="history-id">{order.id}</div>
							<div class="history-date">{order.date}</div>
						</div>
						<div class="history-metrics">
							<div class="metric">
								<span class="metric-label">Petani:</span>
								<span class="metric-val text-primary">{order.farmer}</span>
							</div>
							<div class="metric">
								<span class="metric-label">Berat:</span>
								<span class="metric-val">{order.weight}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<button class="btn-text-full">Lihat Semua Pesanan</button>
		</section>
	</div>
</div>
</div>

<style>
	.page-wrapper {
		min-height: 100dvh;
		background: #fdfbf7;
		position: relative;
		overflow: hidden;
	}
	
	.bg-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		z-index: 0;
		opacity: 0.6;
	}
	
	.blob-1 {
		width: 400px;
		height: 400px;
		background: #bbdefb;
		top: -100px;
		right: -50px;
	}
	
	.blob-2 {
		width: 350px;
		height: 350px;
		background: #c8e6c9;
		bottom: -50px;
		left: -100px;
	}

	.dashboard-container {
		padding: 1.5rem 1.5rem 6rem;
		max-width: 64rem;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.page-title {
		margin: 0 0 0.25rem;
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--color-on-surface);
		letter-spacing: -0.01em;
	}

	.page-subtitle {
		margin: 0;
		color: var(--color-on-surface-variant);
		font-size: 0.9375rem;
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-surface-container-highest);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		border: 1px solid var(--color-outline-variant);
	}
	
	.status-badge .indicator {
		width: 10px;
		height: 10px;
		background-color: var(--color-primary);
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--color-primary-container);
	}
	
	.status-badge .label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.main-grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.main-grid {
			grid-template-columns: 1fr 1fr;
		}
		.actions-section {
			grid-column: 1 / -1;
		}
		.history-section {
			grid-column: 1 / -1;
		}
	}
	
	@media (min-width: 1024px) {
		.main-grid {
			grid-template-columns: 2fr 1fr;
		}
		.actions-section {
			grid-column: 1 / 2;
		}
		.stats-section {
			grid-column: 2 / 3;
			grid-row: 1 / 3;
		}
		.history-section {
			grid-column: 1 / 2;
		}
	}

	.section-card {
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(12px);
		border-radius: var(--radius-card);
		border: 1px solid rgba(255, 255, 255, 0.5);
		padding: 1.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0 0 1.25rem;
		color: var(--color-on-surface);
	}

	.action-grid {
		display: grid;
		gap: 1rem;
	}

	.action-card {
		display: flex;
		align-items: center;
		padding: 1.25rem;
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid transparent;
	}
	
	.primary-action {
		background: var(--color-primary);
		color: white;
	}
	
	.primary-action .action-desc {
		color: rgba(255,255,255,0.8);
	}
	
	.primary-action:hover {
		background: #144b19;
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 12px 24px rgba(27, 94, 32, 0.25);
	}
	
	.secondary-action {
		background: var(--color-surface-container-low);
		border-color: var(--color-outline-variant);
	}
	
	.secondary-action:hover {
		border-color: var(--color-primary);
		background: var(--color-primary-container);
		transform: translateY(-4px) scale(1.02);
		box-shadow: 0 12px 24px rgba(27, 94, 32, 0.1);
	}

	.action-icon {
		font-size: 2rem;
		margin-right: 1rem;
		background: rgba(255,255,255,0.2);
		width: 3.5rem;
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
	}
	
	.secondary-action .action-icon {
		background: white;
		box-shadow: var(--shadow-sm);
	}

	.action-content {
		flex: 1;
	}

	.action-title {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.action-desc {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.3;
	}
	
	.action-arrow {
		font-size: 1.25rem;
		font-weight: bold;
		opacity: 0.5;
		transition: transform 0.2s;
	}
	
	.action-card:hover .action-arrow {
		transform: translateX(4px);
		opacity: 1;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	
	.stat-box {
		background: rgba(255, 255, 255, 0.6);
		padding: 1rem;
		border-radius: var(--radius-md);
		text-align: center;
		border: 1px solid rgba(255, 255, 255, 0.8);
		transition: transform 0.2s, box-shadow 0.2s;
	}
	
	.stat-box:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}
	
	.stat-box.full-width {
		grid-column: 1 / -1;
		background: var(--color-primary-container);
		border-color: var(--color-primary-container);
	}
	
	.stat-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-on-surface);
		margin-bottom: 0.25rem;
	}
	
	.stat-value.text-green {
		color: var(--color-primary);
		font-size: 2rem;
	}
	
	.stat-value .unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-on-surface-variant);
	}
	
	.stat-label {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
		font-weight: 500;
	}
	
	.stat-box.full-width .stat-label {
		color: var(--color-primary);
		font-weight: 600;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.history-item {
		display: flex;
		align-items: center;
		padding: 1rem;
		border: 1px solid var(--color-outline-variant);
		border-radius: var(--radius-md);
		background: var(--color-surface-container-lowest);
		transition: border-color 0.2s;
	}
	
	.history-item:hover {
		border-color: var(--color-primary);
		transform: translateX(4px);
		box-shadow: 0 4px 12px rgba(27, 94, 32, 0.08);
	}
	
	.history-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.25rem;
		margin-right: 1rem;
		flex-shrink: 0;
	}
	
	.history-icon.completed {
		background: var(--color-primary-container);
		color: var(--color-primary);
	}
	
	.history-icon.pending {
		background: #fff8e1;
		color: var(--color-warning);
	}
	
	.history-details {
		flex: 1;
	}
	
	.history-id {
		font-weight: 600;
		font-size: 0.9375rem;
		color: var(--color-on-surface);
		margin-bottom: 0.125rem;
	}
	
	.history-date {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
	}
	
	.history-metrics {
		display: flex;
		gap: 1rem;
		text-align: right;
	}
	
	.metric {
		display: flex;
		flex-direction: column;
	}
	
	.metric-label {
		font-size: 0.6875rem;
		color: var(--color-on-surface-variant);
		margin-bottom: 0.125rem;
	}
	
	.metric-val {
		font-weight: 700;
		font-size: 0.9375rem;
	}
	
	.text-primary { color: var(--color-primary); }
	
	.btn-text-full {
		width: 100%;
		padding: 0.875rem;
		margin-top: 1rem;
		background: var(--color-surface-container-low);
		border: none;
		border-radius: var(--radius-md);
		font-weight: 600;
		color: var(--color-on-surface-variant);
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-text-full:hover {
		background: var(--color-outline-variant);
		color: var(--color-on-surface);
	}
</style>
