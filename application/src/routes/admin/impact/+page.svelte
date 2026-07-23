<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';

	let { data } = $props();

	userRole.set('admin');

	// Real Data from Database
	let impactData = $derived(data.impactData || []);
	let metrics = $derived(data.metrics || { volumeTerdampak: 0, risikoKualitas: 0, keterlambatanLogistik: 0, umkmTerdampak: 0 });

	// Filter states
	let filterCategory = $state('Semua'); // 'Semua', 'Tomat', 'Cabai', 'Logistik'
	let filterPriority = $state('Semua'); // 'Semua', 'Tinggi', 'Sedang', 'Rendah'

	// AI State
	let aiRecommendation = $state(null);
	let isAnalyzing = $state(false);
	let aiError = $state('');

	async function analyzeImpact() {
		if (isAnalyzing) return;
		isAnalyzing = true;
		aiError = '';

		try {
			const res = await fetch('/api/ai/impact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ metrics, incidents: impactData })
			});

			if (!res.ok) throw new Error('Gagal terhubung ke API');
			const result = await res.json();
			
			if (result.error) throw new Error(result.error);
			aiRecommendation = result.recommendation;
		} catch (err) {
			console.error(err);
			aiError = 'Gagal memuat rekomendasi AI. Silakan coba lagi.';
		} finally {
			isAnalyzing = false;
		}
	}

	// Derived filtered data
	let filteredData = $derived(
		impactData.filter(item => {
			const matchCategory = filterCategory === 'Semua' || item.category === filterCategory;
			const matchPriority = filterPriority === 'Semua' || item.priority === filterPriority;
			return matchCategory && matchPriority;
		})
	);

	/** @param {string} id */
	function markAsDone(id) {
		const idx = impactData.findIndex(d => d.id === id);
		if (idx !== -1) {
			impactData[idx].status = 'Selesai';
		}
	}

	/** @param {string} p */
	function getPriorityColor(p) {
		if (p === 'Tinggi') return 'priority-high';
		if (p === 'Sedang') return 'priority-medium';
		return 'priority-low';
	}
	
	/** @param {string} s */
	function getStatusColor(s) {
		if (s === 'Selesai') return 'status-done';
		return 'status-pending';
	}
</script>

<div class="dashboard-layout">
	<!-- Hero Header -->
	<header class="dashboard-hero impact-hero">
		<div class="hero-content">
			<div class="hero-text animate-slide-up">
				<h1 class="page-title">Smart Impact Dashboard</h1>
				<p class="page-subtitle">Analisis Kondisi, Dampak, dan Rekomendasi Tindak Lanjut Rantai Pasok</p>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<div class="content-wrapper">
			<!-- AI Insight Banner -->
			<section class="insight-banner animate-slide-up glass-card" style="animation-delay: 100ms;">
				<div class="insight-icon">💡</div>
				<div class="insight-content">
					<h3 class="insight-title">Rekomendasi AI</h3>
					{#if isAnalyzing}
						<p class="insight-text text-muted">Sedang menganalisis metrik dan log insiden...</p>
					{:else if aiRecommendation}
						<p class="insight-text">{aiRecommendation}</p>
					{:else if aiError}
						<p class="insight-text" style="color: #b91c1c;">{aiError}</p>
					{:else}
						<p class="insight-text text-muted">Klik tombol di samping untuk memulai analisis AI otomatis terhadap data rantai pasok saat ini.</p>
					{/if}
				</div>
				{#if !aiRecommendation}
					<button class="action-btn-primary" onclick={analyzeImpact} disabled={isAnalyzing}>
						{isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis AI'}
					</button>
				{:else}
					<button class="action-btn-primary">Terapkan Solusi Otomatis</button>
				{/if}
			</section>

			<!-- Impact Metrics -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card glass-card warning">
					<div class="stat-icon icon-volume">📦</div>
					<div class="stat-info">
						<div class="stat-label">Volume Terdampak (Minggu Ini)</div>
						<div class="stat-value">{metrics.volumeTerdampak} <span class="stat-unit">kg</span></div>
					</div>
				</div>
				<div class="stat-card glass-card danger">
					<div class="stat-icon icon-quality">📉</div>
					<div class="stat-info">
						<div class="stat-label">Risiko Kualitas Buruk</div>
						<div class="stat-value">{metrics.risikoKualitas}<span class="stat-unit">%</span></div>
					</div>
				</div>
				<div class="stat-card glass-card caution">
					<div class="stat-icon icon-logistic">🚚</div>
					<div class="stat-info">
						<div class="stat-label">Keterlambatan Logistik</div>
						<div class="stat-value">{metrics.keterlambatanLogistik} <span class="stat-unit">kasus</span></div>
					</div>
				</div>
				<div class="stat-card glass-card info">
					<div class="stat-icon icon-umkm">🏪</div>
					<div class="stat-info">
						<div class="stat-label">UMKM Terdampak</div>
						<div class="stat-value">{metrics.umkmTerdampak} <span class="stat-unit">unit</span></div>
					</div>
				</div>
			</section>

			<!-- Action Log & Filters -->
			<section class="section-card animate-slide-up" style="animation-delay: 300ms;">
				<div class="section-header">
					<h2 class="section-title">Log Tindakan & Insiden</h2>
					<div class="filters">
						<div class="filter-group">
							<label for="cat">Kategori:</label>
							<select id="cat" bind:value={filterCategory} class="filter-select">
								<option value="Semua">Semua Kategori</option>
								<option value="Tomat">Tomat</option>
								<option value="Cabai">Cabai</option>
								<option value="Logistik">Logistik</option>
							</select>
						</div>
						<div class="filter-group">
							<label for="prio">Prioritas:</label>
							<select id="prio" bind:value={filterPriority} class="filter-select">
								<option value="Semua">Semua Prioritas</option>
								<option value="Tinggi">Tinggi</option>
								<option value="Sedang">Sedang</option>
								<option value="Rendah">Rendah</option>
							</select>
						</div>
					</div>
				</div>

				<div class="data-table-container">
					<table class="data-table">
						<thead>
							<tr>
								<th>Nama Item / Insiden</th>
								<th>Kategori</th>
								<th>Status</th>
								<th>Prioritas</th>
								<th>Waktu</th>
								<th class="text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredData as item}
								<tr class="table-row">
									<td class="td-name">
										<div class="item-id">{item.id}</div>
										<div class="item-name">{item.name}</div>
									</td>
									<td><span class="badge badge-outline">{item.category}</span></td>
									<td>
										<span class="badge {getStatusColor(item.status)}">{item.status}</span>
									</td>
									<td>
										<span class="badge {getPriorityColor(item.priority)}">
											{#if item.priority === 'Tinggi'}🔥{/if}
											{#if item.priority === 'Sedang'}⚠️{/if}
											{item.priority}
										</span>
									</td>
									<td class="td-time">{item.time}</td>
									<td class="td-action">
										{#if item.status === 'Pending'}
											<button class="action-btn-sm" onclick={() => markAsDone(item.id)}>Selesaikan</button>
										{:else}
											<span class="text-muted">Selesai</span>
										{/if}
									</td>
								</tr>
							{/each}
							{#if filteredData.length === 0}
								<tr>
									<td colspan="6" class="empty-state">Tidak ada data yang sesuai dengan filter.</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	</main>
</div>

<style>
	.dashboard-layout {
		min-height: 100dvh;
		background: #f8fafc;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding-bottom: 4rem;
	}

	.impact-hero {
		background: #ffffff;
		padding: 2.5rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.hero-content {
		max-width: 64rem;
		margin: 0 auto;
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

	/* Insight Banner */
	.insight-banner {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.5rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		flex-wrap: wrap;
	}

	.insight-icon {
		font-size: 2rem;
		background: #f1f5f9;
		width: 3.5rem;
		height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		flex-shrink: 0;
	}

	.insight-content {
		flex: 1;
		min-width: 300px;
	}

	.insight-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 800;
		color: #0f172a;
	}

	.insight-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #475569;
	}
	.insight-text strong { color: #0f172a; }

	.action-btn-primary {
		padding: 0.625rem 1.25rem;
		background: #8b5cf6;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.action-btn-primary:hover {
		background: #7c3aed;
	}

	/* Stats */
	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.stats-overview { grid-template-columns: repeat(2, 1fr); }
	}
	@media (min-width: 1024px) {
		.stats-overview { grid-template-columns: repeat(4, 1fr); }
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: #ffffff;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		transition: border-color 0.2s;
	}
	.stat-card:hover { border-color: #cbd5e1; }

	.stat-icon {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		font-size: 1.25rem;
		border: 1px solid #e2e8f0;
	}

	.icon-volume { background: #f8fafc; }
	.icon-quality { background: #fef2f2; }
	.icon-logistic { background: #fffbeb; }
	.icon-umkm { background: #f0f9ff; }

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
		font-size: 1.5rem;
		font-weight: 800;
		color: #0f172a;
		line-height: 1;
	}
	.stat-unit { font-size: 0.875rem; color: #94a3b8; font-weight: 600; }

	/* Section & Table */
	.section-card {
		background: #ffffff;
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #e2e8f0;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0;
	}

	.filters {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-group label {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #475569;
	}

	.filter-select {
		padding: 0.35rem 2rem 0.35rem 1rem;
		border-radius: 6px;
		border: 1px solid #e2e8f0;
		background: #f8fafc;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #0f172a;
		cursor: pointer;
		appearance: none;
		outline: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1rem;
	}
	.filter-select:hover { border-color: #cbd5e1; }

	.data-table-container {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		text-align: left;
	}

	.data-table th {
		padding: 0.5rem 1rem;
		font-size: 0.6875rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 2px solid #e2e8f0;
		white-space: nowrap;
	}

	.data-table td {
		padding: 1rem;
		border-bottom: 1px solid #f1f5f9;
		vertical-align: middle;
	}

	.data-table tr:last-child td { border-bottom: none; }

	.td-name { min-width: 200px; }
	.item-id { font-size: 0.6875rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
	.item-name { font-size: 0.875rem; font-weight: 700; color: #0f172a; }

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		font-size: 0.6875rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.badge-outline { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
	
	.priority-high { background: #fef2f2; color: #b91c1c; }
	.priority-medium { background: #fffbeb; color: #b45309; }
	.priority-low { background: #f0f9ff; color: #0369a1; }

	.status-pending { background: #fffbeb; color: #b45309; }
	.status-done { background: #dcfce7; color: #15803d; }

	.td-time { font-size: 0.8125rem; color: #64748b; font-weight: 600; white-space: nowrap; }

	.text-right { text-align: right; }
	.td-action { text-align: right; }
	
	.text-muted { font-size: 0.8125rem; color: #94a3b8; font-weight: 600; }

	.action-btn-sm {
		padding: 0.35rem 0.75rem;
		background: #f1f5f9;
		color: #0f172a;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}
	.action-btn-sm:hover { background: #e2e8f0; }

	.empty-state { text-align: center; padding: 3rem !important; color: #64748b; font-weight: 500; }

	/* Animations */
	.animate-slide-up { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
	.animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }

	@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>
