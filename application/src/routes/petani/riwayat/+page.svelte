<script>
	let { data } = $props();
</script>

<div class="page-layout">
	<header class="page-header">
		<a href="/petani" class="back-link">← Kembali ke Dashboard</a>
		<h1 class="page-title">Riwayat Semua Panen</h1>
		<p class="page-subtitle">Daftar lengkap seluruh unggahan panen Anda beserta hasil verifikasi kualitas.</p>
	</header>

	<main class="page-main">
		<div class="history-list">
			{#if data.harvests.length === 0}
				<div class="empty-state">
					<p>Belum ada riwayat panen.</p>
				</div>
			{:else}
				{#each data.harvests as harvest}
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
			{/if}
		</div>
	</main>
</div>

<style>
	.page-layout {
		min-height: 100dvh;
		background: #faf9f5;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding: 2rem 1.5rem 6rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: var(--color-on-surface-variant);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}
	
	.back-link:hover {
		color: var(--color-primary);
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-on-surface);
		margin: 0 0 0.5rem;
	}
	
	.page-subtitle {
		color: var(--color-on-surface-variant);
		margin: 0;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.history-item {
		display: flex;
		align-items: center;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: 1.25rem;
		border: 1px solid var(--color-outline-variant);
		transition: all 0.2s ease;
		text-decoration: none;
		color: inherit;
		gap: 1rem;
	}

	.history-item.hoverable:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border-color: var(--color-primary-container);
	}

	.status-indicator {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.status-indicator.verified {
		background: #e8f5e9;
		color: #2e7d32;
	}

	.status-indicator.alert {
		background: #ffebee;
		color: #c62828;
	}

	.history-info {
		flex: 1;
	}

	.history-info h4 {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #1a1a1a;
	}

	.history-info p {
		margin: 0;
		font-size: 0.875rem;
		color: #666;
	}

	.history-metrics {
		display: flex;
		gap: 1.5rem;
		text-align: right;
	}

	.metric {
		display: flex;
		flex-direction: column;
	}

	.m-label {
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.m-val {
		font-weight: 600;
		font-size: 1rem;
	}

	.score-a { color: #2e7d32; }
	.score-b { color: #f57f17; }
	.score-c { color: #c62828; }
	
	.empty-state {
		text-align: center;
		padding: 3rem;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px dashed var(--color-outline-variant);
		color: var(--color-on-surface-variant);
	}
	
	@media (max-width: 600px) {
		.history-metrics {
			gap: 1rem;
		}
		.history-item {
			padding: 1rem;
		}
	}
</style>
