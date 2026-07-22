<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	import QualityScoreCard from '$lib/components/QualityScoreCard.svelte';
	
	let recentHarvests = $state([
		{ id: 'BATCH-001', date: 'Hari ini, 08:30', quality: 92, weight: '50 kg', status: 'verified' },
		{ id: 'BATCH-002', date: 'Kemarin, 14:15', quality: 85, weight: '120 kg', status: 'verified' },
		{ id: 'BATCH-003', date: '12 Jun 2026', quality: 78, weight: '45 kg', status: 'alert' }
	]);

	onMount(() => {
		userRole.set('petani');
	});
</script>

<div class="dashboard-layout">
	<!-- Hero Header -->
	<header class="dashboard-hero">
		<div class="mesh-bg"></div>
		<div class="hero-content">
			<div class="hero-text animate-slide-up">
				<h1 class="page-title">Selamat datang, Petani!</h1>
				<p class="page-subtitle">Kelola panen dan pantau kualitas tomat Anda hari ini.</p>
			</div>
			<div class="reputation-badge animate-slide-up" style="animation-delay: 100ms;">
				<div class="star-icon">⭐</div>
				<div class="rep-text">
					<span class="score">4.8</span>
					<span class="label">Reputasi Tinggi</span>
				</div>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<div class="content-wrapper">
			<!-- Overlapping Stats Section -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card glass-card">
					<div class="stat-icon primary-light">📦</div>
					<div class="stat-info">
						<div class="stat-label">Total Panen Terjual</div>
						<div class="stat-value">345 <span class="unit">kg</span></div>
					</div>
				</div>
				<div class="stat-card glass-card">
					<div class="stat-icon primary-light">⭐</div>
					<div class="stat-info">
						<div class="stat-label">Rata-rata Kualitas</div>
						<div class="stat-value">88.5 <span class="unit">/ 100</span></div>
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
						<QualityScoreCard score={88.5} />
					</section>
				</div>

				<div class="right-col">
					<!-- Recent Activity -->
					<section class="section-card animate-slide-up" style="animation-delay: 500ms;">
						<div class="section-header">
							<h2 class="section-title">Riwayat Panen</h2>
							<button class="btn-link">Lihat Semua</button>
						</div>
						<div class="history-list">
							{#each recentHarvests as harvest}
								<div class="history-item">
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
								</div>
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
		background: #faf9f5;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding-bottom: 6rem; /* space for mobile nav */
	}

	.dashboard-hero {
		position: relative;
		background: #0a2e11;
		padding: 3rem 1.5rem 6rem;
		overflow: hidden;
		color: #ffffff;
	}

	.mesh-bg {
		position: absolute;
		inset: -50%;
		background: 
			radial-gradient(circle at 20% 30%, rgba(27, 94, 32, 0.8) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.6) 0%, transparent 50%),
			radial-gradient(circle at 50% 10%, rgba(139, 195, 74, 0.4) 0%, transparent 50%);
		filter: blur(60px);
		animation: pulseBg 15s ease-in-out infinite alternate;
		z-index: 0;
	}

	@keyframes pulseBg {
		0% { transform: scale(1) translate(0, 0); }
		100% { transform: scale(1.1) translate(-2%, 2%); }
	}

	.hero-content {
		position: relative;
		z-index: 1;
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
		margin: 0 0 0.5rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.5;
	}

	.reputation-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.75rem 1rem;
		border-radius: 16px;
	}

	.star-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
	}

	.rep-text {
		display: flex;
		flex-direction: column;
	}

	.rep-text .score {
		font-size: 1.125rem;
		font-weight: 800;
		line-height: 1;
	}

	.rep-text .label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #a5d6a7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.125rem;
	}

	.dashboard-main {
		position: relative;
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.content-wrapper {
		margin-top: -3rem; /* Overlap effect */
		position: relative;
		z-index: 10;
	}

	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 640px) {
		.stats-overview {
			grid-template-columns: 1fr 1fr;
		}
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #ffffff;
		padding: 1.25rem;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
		border: 1px solid #f3f4f6;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(27, 94, 32, 0.08);
	}

	.stat-icon {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-size: 1.25rem;
	}

	.stat-icon.primary-light {
		background: #e8f5e9;
		color: #1b5e20;
	}

	.stat-info {
		flex: 1;
	}

	.stat-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: #111827;
		line-height: 1;
	}

	.stat-value .unit {
		font-size: 0.875rem;
		font-weight: 600;
		color: #9ca3af;
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
		border-radius: 20px;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
		border: 1px solid #f3f4f6;
		margin-bottom: 1.5rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
	}

	.btn-link {
		background: none;
		border: none;
		color: #1b5e20;
		font-size: 0.8125rem;
		font-weight: 600;
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
		border-radius: 16px;
		text-decoration: none;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		gap: 1rem;
	}

	.action-card.primary {
		background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
		color: #ffffff;
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.2);
	}

	.action-card.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.3);
	}

	.action-card.secondary {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		color: #111827;
	}

	.action-card.secondary:hover {
		border-color: #1b5e20;
		background: #f8fcf8;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.08);
	}

	.action-icon-wrapper {
		font-size: 1.75rem;
		width: 3.5rem;
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		background: rgba(255,255,255,0.2);
	}

	.action-card.secondary .action-icon-wrapper {
		background: #e8f5e9;
	}

	.action-text {
		flex: 1;
	}

	.action-text h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.action-card.secondary .action-text h3 {
		color: #111827;
	}

	.action-text p {
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.9;
	}

	.action-card.secondary .action-text p {
		color: #6b7280;
	}

	.arrow {
		font-size: 1.25rem;
		font-weight: bold;
		opacity: 0.5;
		transition: transform 0.3s;
	}

	.action-card:hover .arrow {
		transform: translateX(4px);
		opacity: 1;
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
		border-radius: 12px;
		background: #f9fafb;
		border: 1px solid transparent;
		transition: all 0.2s;
	}

	.history-item:hover {
		background: #ffffff;
		border-color: #e5e7eb;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
		transform: translateX(4px);
	}

	.status-indicator {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1rem;
		margin-right: 1rem;
		flex-shrink: 0;
	}

	.status-indicator.verified {
		background: #e8f5e9;
		color: #1b5e20;
	}

	.status-indicator.alert {
		background: #ffebee;
		color: #d32f2f;
	}

	.history-info {
		flex: 1;
	}

	.history-info h4 {
		margin: 0 0 0.125rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #111827;
	}

	.history-info p {
		margin: 0;
		font-size: 0.75rem;
		color: #6b7280;
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
		color: #6b7280;
		margin-bottom: 0.125rem;
	}

	.m-val {
		font-size: 0.875rem;
		font-weight: 700;
		color: #111827;
	}

	.score-a { color: #1b5e20; }
	.score-b { color: #f9a825; }
	.score-c { color: #d32f2f; }

	/* Animations */
	.animate-slide-up {
		animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}
	.animate-fade-in-up {
		animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(30px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
