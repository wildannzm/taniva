<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	import QualityScoreCard from '$lib/components/QualityScoreCard.svelte';
	
	let { data } = $props();
	
	let recentHarvests = $derived(data.recentHarvests || []);

	onMount(() => {
		userRole.set('petani');
	});
</script>

<div class="dashboard-layout">
	<!-- Hero Header -->
	<!-- Flat Hero Header -->
	<header class="dashboard-hero">
		<div class="hero-content">
			<div class="hero-text animate-slide-up">
				<h1 class="page-title">Selamat datang, {data.user?.name}!</h1>
				<p class="page-subtitle">Kelola panen dan pantau kualitas tomat Anda hari ini.</p>
			</div>
			<div class="reputation-badge flat-panel animate-slide-up" style="animation-delay: 100ms;">
				<div class="star-icon">⭐</div>
				<div class="rep-text">
					<span class="score">{data.stats?.reputasi || 0}</span>
					<span class="label">Reputasi {(data.stats?.reputasi || 0) >= 80 ? 'Tinggi' : ((data.stats?.reputasi || 0) >= 50 ? 'Menengah' : 'Rendah')}</span>
				</div>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<div class="content-wrapper">
			<!-- Overlapping Stats Section -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card">
					<div class="stat-icon primary-light">📦</div>
					<div class="stat-info">
						<div class="stat-label">Total Panen Terjual</div>
						<div class="stat-value">{data.stats?.totalPanenTerjual || 0} <span class="unit">kg</span></div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon primary-light">⭐</div>
					<div class="stat-info">
						<div class="stat-label">Rata-rata Kualitas</div>
						<div class="stat-value">{data.stats?.rataKualitas || 0} <span class="unit">/ 100</span></div>
					</div>
				</div>
			</section>

			<div class="main-grid">
				<div class="left-col">
					<!-- Quick Actions -->
					<section class="section-card animate-slide-up" style="animation-delay: 300ms;">
						<div class="section-header">
							<h2 class="section-title">Aksi Cepat</h2>
						</div>
						<div class="action-grid">
							<a href="/petani/upload" class="action-card primary">
								<div class="action-icon-wrapper">📸</div>
								<div class="action-text">
									<h3>Grading Panen</h3>
									<p>Verifikasi kualitas dengan AI</p>
								</div>
								<div class="arrow">→</div>
							</a>
							<a href="/petani/reputasi" class="action-card secondary">
								<div class="action-icon-wrapper">📈</div>
								<div class="action-text">
									<h3>Detail Reputasi</h3>
									<p>Lihat riwayat rating UMKM</p>
								</div>
								<div class="arrow">→</div>
							</a>
						</div>
					</section>

					<!-- Quality Score -->
					<section class="section-card animate-slide-up" style="animation-delay: 400ms;">
						<div class="section-header">
							<h2 class="section-title">Skor Kualitas Bulan Ini</h2>
						</div>
						<QualityScoreCard score={data.stats?.rataKualitas || 0} />
					</section>
				</div>

				<div class="right-col">
					<!-- Recent Activity -->
					<section class="section-card animate-slide-up" style="animation-delay: 500ms;">
						<div class="section-header">
							<h2 class="section-title">Riwayat Panen</h2>
							<a href="/petani/riwayat" class="btn-link">Lihat Semua</a>
						</div>
						<div class="history-list">
							{#each recentHarvests as harvest}
								<a href={harvest.certificateCode ? `/verify/${harvest.certificateCode}` : '#'} class="history-item {harvest.certificateCode ? 'hoverable' : ''}">
									<div class="status-indicator {harvest.status}">
										{#if harvest.status === 'verified'}
											✓
										{:else}
											!
										{/if}
									</div>
									<div class="history-info">
										<h4>{harvest.id}</h4>
										<p>{harvest.date}</p>
									</div>
									<div class="history-metrics">
										<div class="metric">
											<span class="m-label">Berat</span>
											<span class="m-val">{harvest.weight}</span>
										</div>
										<div class="metric">
											<span class="m-label">Mutu</span>
											<span class="m-val score-{harvest.quality >= 90 ? 'a' : harvest.quality >= 80 ? 'b' : 'c'}">{harvest.quality}</span>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</section>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.dashboard-layout {
		min-height: 100dvh;
		background: #f8fafc;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding-bottom: 6rem; /* space for mobile nav */
		color: #0f172a;
	}

	.dashboard-hero {
		background: #ffffff;
		padding: 2.5rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.hero-content {
		max-width: 64rem;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.hero-text {
		max-width: 400px;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 800;
		margin: 0 0 0.25rem;
		color: #0f172a;
	}

	.page-subtitle {
		font-size: 0.9375rem;
		color: #64748b;
		margin: 0;
	}

	.reputation-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		padding: 0.75rem 1rem;
		border-radius: 8px;
	}

	.star-icon {
		font-size: 1.5rem;
	}

	.rep-text {
		display: flex;
		flex-direction: column;
	}

	.rep-text .score {
		font-size: 1.125rem;
		font-weight: 800;
		line-height: 1;
		color: #0f172a;
	}

	.rep-text .label {
		font-size: 0.6875rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.125rem;
	}

	.dashboard-main {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.stats-overview {
			grid-template-columns: 1fr 1fr;
		}
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		background: #ffffff;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		transition: border-color 0.2s;
	}

	.stat-card:hover {
		border-color: #cbd5e1;
	}

	.stat-icon {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-size: 1.5rem;
		border: 1px solid #e2e8f0;
	}

	.stat-icon.primary-light {
		background: #f1f5f9;
		color: #0f172a;
	}

	.stat-info { flex: 1; }

	.stat-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 800;
		color: #0f172a;
		line-height: 1;
	}

	.stat-value .unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: #94a3b8;
	}

	.main-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.main-grid {
			grid-template-columns: 3fr 2fr;
		}
	}

	.section-card {
		background: #ffffff;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0;
	}

	.btn-link {
		background: none;
		border: none;
		color: #1b5e20;
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
	}

	.action-grid {
		display: grid;
		gap: 1rem;
	}

	.action-card {
		display: flex;
		align-items: center;
		padding: 1.25rem;
		border-radius: 12px;
		text-decoration: none;
		transition: background 0.2s, border-color 0.2s;
		gap: 1rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		color: #0f172a;
	}

	.action-card.primary {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}

	.action-card:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}

	.action-icon-wrapper {
		font-size: 1.5rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
	}

	.action-text { flex: 1; }

	.action-text h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 800;
		color: #0f172a;
	}

	.action-text p {
		margin: 0;
		font-size: 0.8125rem;
		color: #64748b;
	}

	.arrow {
		font-size: 1.25rem;
		font-weight: bold;
		opacity: 0.3;
		color: #0f172a;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.history-item {
		display: flex;
		align-items: center;
		background: #ffffff;
		border-radius: 8px;
		padding: 1rem;
		border: 1px solid #e2e8f0;
		transition: background 0.2s;
		text-decoration: none;
		color: inherit;
		gap: 1rem;
	}

	.history-item.hoverable:hover {
		background: #f8fafc;
	}

	.status-indicator {
		width: 2rem;
		height: 2rem;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1rem;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.status-indicator.verified {
		background: #dcfce7;
		color: #166534;
	}

	.status-indicator.alert {
		background: #fef2f2;
		color: #b91c1c;
	}

	.history-info { flex: 1; }

	.history-info h4 {
		margin: 0 0 0.125rem;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #0f172a;
	}

	.history-info p {
		margin: 0;
		font-size: 0.75rem;
		color: #64748b;
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

	.m-label {
		font-size: 0.6875rem;
		color: #64748b;
		margin-bottom: 0.125rem;
	}

	.m-val {
		font-size: 0.875rem;
		font-weight: 800;
		color: #0f172a;
	}

	.score-a { color: #166534; }
	.score-b { color: #b45309; }
	.score-c { color: #b91c1c; }

	/* Animations */
	.animate-slide-up {
		animation: slideUp 0.4s ease-out forwards;
		opacity: 0;
	}
	.animate-fade-in-up {
		animation: fadeInUp 0.5s ease-out forwards;
		opacity: 0;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(15px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
