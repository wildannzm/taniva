<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';

	userRole.set('admin');

	// Mock Data for Smart Impact Dashboard
	let impactData = $state([
		{ id: 'BATCH-2026-001', name: 'Panen Tomat Kebun Berkah', category: 'Tomat', status: 'Pending', priority: 'Tinggi', time: '10:30, Hari ini' },
		{ id: 'LOG-2026-089', name: 'Keterlambatan Kurir Solo-Boyolali', category: 'Logistik', status: 'Pending', priority: 'Sedang', time: '09:15, Hari ini' },
		{ id: 'BATCH-2026-002', name: 'Panen Cabai Pak Slamet', category: 'Cabai', status: 'Selesai', priority: 'Rendah', time: 'Kemarin' },
		{ id: 'BATCH-2026-003', name: 'Panen Tomat Busuk Area X', category: 'Tomat', status: 'Pending', priority: 'Tinggi', time: 'Kemarin' },
		{ id: 'REQ-2026-101', name: 'Kekurangan Pasokan UMKM Siti', category: 'Tomat', status: 'Selesai', priority: 'Sedang', time: '2 Hari Lalu' },
	]);

	// Filter states
	let filterCategory = $state('Semua'); // 'Semua', 'Tomat', 'Cabai', 'Logistik'
	let filterPriority = $state('Semua'); // 'Semua', 'Tinggi', 'Sedang', 'Rendah'

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
		<div class="mesh-bg"></div>
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
					<p class="insight-text">
						Ditemukan peningkatan <strong>15%</strong> pada tomat kualitas rendah (Rotten) di rute pengiriman Boyolali. 
						<strong>Rekomendasi Tindak Lanjut:</strong> Segera hubungi kelompok tani terkait untuk evaluasi metode pasca-panen atau alihkan pasokan logistik jalur cepat.
					</p>
				</div>
				<button class="action-btn-primary">Terapkan Solusi Otomatis</button>
			</section>

			<!-- Impact Metrics -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card glass-card warning">
					<div class="stat-icon icon-volume">📦</div>
					<div class="stat-info">
						<div class="stat-label">Volume Terdampak (Minggu Ini)</div>
						<div class="stat-value">124 <span class="stat-unit">kg</span></div>
					</div>
				</div>
				<div class="stat-card glass-card danger">
					<div class="stat-icon icon-quality">📉</div>
					<div class="stat-info">
						<div class="stat-label">Risiko Kualitas Buruk</div>
						<div class="stat-value">15<span class="stat-unit">%</span></div>
					</div>
				</div>
				<div class="stat-card glass-card caution">
					<div class="stat-icon icon-logistic">🚚</div>
					<div class="stat-info">
						<div class="stat-label">Keterlambatan Logistik</div>
						<div class="stat-value">3 <span class="stat-unit">kasus</span></div>
					</div>
				</div>
				<div class="stat-card glass-card info">
					<div class="stat-icon icon-umkm">🏪</div>
					<div class="stat-info">
						<div class="stat-label">UMKM Terdampak</div>
						<div class="stat-value">8 <span class="stat-unit">unit</span></div>
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
		background: #faf9f5;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding-bottom: 4rem;
	}

	.impact-hero {
		position: relative;
		background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
		padding: 3rem 1.5rem 6rem;
		overflow: hidden;
		color: #ffffff;
	}

	.mesh-bg {
		position: absolute;
		inset: -50%;
		background: 
			radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
			radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.3) 0%, transparent 50%);
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
	}

	.page-title {
		font-size: 2rem;
		font-weight: 800;
		margin: 0 0 0.5rem;
		line-height: 1.2;
		background: linear-gradient(135deg, #fff 0%, #fbcfe8 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.page-subtitle {
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
	}

	.dashboard-main {
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.content-wrapper {
		margin-top: -3rem;
		position: relative;
		z-index: 10;
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
		background: rgba(255, 255, 255, 0.95);
		border-left: 4px solid #8b5cf6;
		flex-wrap: wrap;
	}

	.insight-icon {
		font-size: 2.5rem;
		background: #ede9fe;
		width: 4rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 1rem;
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
		color: #111827;
	}

	.insight-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.6;
		color: #4b5563;
	}
	.insight-text strong { color: #111827; }

	.action-btn-primary {
		padding: 0.75rem 1.5rem;
		background: #8b5cf6;
		color: white;
		border: none;
		border-radius: 100px;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
	}

	.action-btn-primary:hover {
		background: #7c3aed;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
	}

	/* Stats */
	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
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
		padding: 1.25rem;
		border-radius: 16px;
		border: 1px solid #f3f4f6;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.stat-card:hover { transform: translateY(-2px); }

	.stat-icon {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		font-size: 1.25rem;
	}

	.icon-volume { background: #f3f4f6; }
	.icon-quality { background: #fee2e2; }
	.icon-logistic { background: #fef3c7; }
	.icon-umkm { background: #e0f2fe; }

	.stat-info { flex: 1; }
	.stat-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: #111827;
		line-height: 1;
	}
	.stat-unit { font-size: 0.875rem; color: #9ca3af; font-weight: 600; }

	/* Section & Table */
	.section-card {
		background: #ffffff;
		border-radius: 20px;
		padding: 1.5rem;
		border: 1px solid #f3f4f6;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 800;
		color: #111827;
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
		font-weight: 600;
		color: #4b5563;
	}

	.filter-select {
		padding: 0.5rem 2rem 0.5rem 1rem;
		border-radius: 100px;
		border: 1px solid #e5e7eb;
		background: #f9fafb;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #111827;
		cursor: pointer;
		appearance: none;
		outline: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		background-size: 1rem;
	}
	.filter-select:hover { border-color: #d1d5db; }

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
		padding: 1rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 2px solid #f3f4f6;
		white-space: nowrap;
	}

	.data-table td {
		padding: 1rem;
		border-bottom: 1px solid #f3f4f6;
		vertical-align: middle;
	}

	.data-table tr:last-child td { border-bottom: none; }
	.data-table tr:hover td { background: #f9fafb; }

	.td-name { min-width: 200px; }
	.item-id { font-size: 0.6875rem; font-weight: 700; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
	.item-name { font-size: 0.9375rem; font-weight: 700; color: #111827; }

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.badge-outline { background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; }
	
	.priority-high { background: #fee2e2; color: #b91c1c; }
	.priority-medium { background: #fef3c7; color: #b45309; }
	.priority-low { background: #e0f2fe; color: #0369a1; }

	.status-pending { background: #fef3c7; color: #b45309; }
	.status-done { background: #dcfce7; color: #15803d; }

	.td-time { font-size: 0.8125rem; color: #6b7280; font-weight: 500; white-space: nowrap; }

	.text-right { text-align: right; }
	.td-action { text-align: right; }
	
	.text-muted { font-size: 0.8125rem; color: #9ca3af; font-weight: 600; }

	.action-btn-sm {
		padding: 0.5rem 1rem;
		background: #111827;
		color: white;
		border: none;
		border-radius: 100px;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}
	.action-btn-sm:hover { background: #374151; }

	.empty-state { text-align: center; padding: 3rem !important; color: #6b7280; font-weight: 500; }

	.glass-card {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.5);
	}

	/* Animations */
	.animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
	.animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

	@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
	@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
