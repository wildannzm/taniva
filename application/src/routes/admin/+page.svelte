<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';

	let { data } = $props();

	userRole.set('admin');

	let summary = $derived(data.summary || { totalUsers: 0, todayActivities: 0, totalActivities: 0, roleDist: {}, recentActivities: [] });
	let registeredUsers = $derived(data.registeredUsers || []);
	let now = $state(new Date());

	// Live clock
	onMount(() => {
		const interval = setInterval(() => { now = new Date(); }, 1000);
		return () => clearInterval(interval);
	});

	/** @param {string} iso */
	function timeAgo(iso) {
		const diff = Date.now() - new Date(iso).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'Baru saja';
		if (mins < 60) return `${mins} menit lalu`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} jam lalu`;
		const days = Math.floor(hours / 24);
		return `${days} hari lalu`;
	}

	/** @param {string} role */
	function roleIcon(role) {
		if (role === 'petani') return '🧑‍🌾';
		if (role === 'umkm') return '🍽️';
		return '🛡️';
	}

	/** @param {string} role */
	function roleBadgeClass(role) {
		if (role === 'petani') return 'badge-petani';
		if (role === 'umkm') return 'badge-umkm';
		return 'badge-admin';
	}

	let totalAll = $derived(Object.values(summary.roleDist).reduce((a, b) => a + b, 0) || 1);
</script>

<div class="dashboard-layout">
	<!-- Flat Header -->
	<header class="admin-header">
		<div class="header-content">
			<div class="header-text animate-slide-up">
				<h1 class="page-title">Dashboard {data.user?.name || 'Admin'}</h1>
				<p class="page-subtitle">Pantau seluruh aktivitas ekosistem Taniva secara real-time.</p>
			</div>
			<div class="header-actions animate-slide-up" style="animation-delay: 100ms;">
				<div class="clock-badge flat-panel">
					<div class="clock-icon">🕐</div>
					<div class="clock-text">
						<span class="clock-time">{now.toLocaleTimeString('id-ID')}</span>
						<span class="clock-date">{now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
					</div>
				</div>
				<a href="/admin/impact" class="impact-link-btn">Smart Impact →</a>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<div class="content-wrapper">
			<!-- Stats Overview -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card">
					<div class="stat-icon icon-users">👥</div>
					<div class="stat-info">
						<div class="stat-label">Pengguna Terdaftar</div>
						<div class="stat-value">{registeredUsers.length}</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon icon-today">📊</div>
					<div class="stat-info">
						<div class="stat-label">Aktivitas Hari Ini</div>
						<div class="stat-value">{summary.todayActivities}</div>
					</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon icon-total">🔢</div>
					<div class="stat-info">
						<div class="stat-label">Total Log Aktivitas</div>
						<div class="stat-value">{summary.totalActivities}</div>
					</div>
				</div>
			</section>

			<div class="main-grid">
				<!-- Left Column -->
				<div class="left-col">
					<!-- Activity Distribution -->
					<section class="section-card animate-slide-up" style="animation-delay: 300ms;">
						<div class="section-header">
							<h2 class="section-title">Distribusi Aktivitas per Peran</h2>
						</div>
						<div class="dist-chart">
							{#each Object.entries(summary.roleDist).filter(([role]) => role !== 'admin') as [role, count]}
								<div class="dist-row">
									<div class="dist-label">
										<span class="dist-icon">{roleIcon(role)}</span>
										<span class="dist-role">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
									</div>
									<span class="dist-count">{count}</span>
								</div>
							{/each}
							{#if Object.keys(summary.roleDist).filter(r => r !== 'admin').length === 0}
								<p class="empty-text">Belum ada data aktivitas.</p>
							{/if}
						</div>
					</section>

					<!-- Registered Users -->
					<section class="section-card animate-slide-up" style="animation-delay: 400ms;">
						<div class="section-header">
							<h2 class="section-title">Daftar Pengguna</h2>
							<span class="user-count-badge">{registeredUsers.length} akun</span>
						</div>
						<div class="users-table">
							<div class="table-header-row">
								<span>Username</span>
								<span>Peran</span>
							</div>
							{#each registeredUsers as user}
								<div class="table-row">
									<span class="table-username">{user.username}</span>
									<span class="table-role-badge {roleBadgeClass(user.role)}">
										{roleIcon(user.role)} {user.role}
									</span>
								</div>
							{/each}
						</div>
					</section>
				</div>

				<!-- Right Column -->
				<div class="right-col">
					<!-- Recent Activities Timeline -->
					<section class="section-card animate-slide-up" style="animation-delay: 500ms;">
						<div class="section-header">
							<h2 class="section-title">Aktivitas Terbaru</h2>
						</div>
						<div class="timeline">
							{#each summary.recentActivities as activity, i}
								<div class="timeline-item" style="animation-delay: {i * 50}ms;">
									<div class="timeline-dot {roleBadgeClass(activity.role)}"></div>
									<div class="timeline-content">
										<div class="timeline-top">
											<span class="timeline-action">{activity.action}</span>
											<span class="timeline-time">{timeAgo(activity.timestamp)}</span>
										</div>
										<p class="timeline-detail">{activity.detail}</p>
										<div class="timeline-meta">
											<span class="timeline-user">@{activity.username}</span>
											<span class="timeline-role-badge {roleBadgeClass(activity.role)}">{activity.role}</span>
										</div>
									</div>
								</div>
							{/each}
							{#if summary.recentActivities.length === 0}
								<p class="empty-text">Belum ada aktivitas tercatat.</p>
							{/if}
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
		padding-bottom: 4rem;
		color: var(--color-ink);
	}

	/* Flat Header */
	.admin-header {
		background: #ffffff;
		padding: 2.5rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.header-content {
		max-width: 64rem;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.header-text { max-width: 480px; }

	.page-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-ink);
		margin: 0 0 0.25rem;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		font-size: 0.9375rem;
		color: var(--color-smoke);
		margin: 0;
		line-height: 1.5;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Flat Panel */
	.flat-panel {
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
	}

	.clock-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
	}

	.clock-icon { font-size: 1.25rem; }

	.clock-text {
		display: flex;
		flex-direction: column;
	}

	.clock-time {
		font-size: 0.875rem;
		font-weight: 800;
		color: var(--color-ink);
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}

	.clock-date {
		font-size: 0.625rem;
		color: var(--color-smoke);
		font-weight: 600;
	}

	.impact-link-btn {
		display: inline-block;
		padding: 0.625rem 1.25rem;
		background: #1b5e20;
		color: #ffffff;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.875rem;
		transition: background 0.2s;
	}

	.impact-link-btn:hover {
		background: #144517;
	}

	/* Main Content */
	.dashboard-main {
		max-width: 64rem;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.content-wrapper {
		position: relative;
	}

	/* Flat Cards */
	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		margin-bottom: 2.5rem;
	}

	@media (min-width: 640px) {
		.stats-overview {
			grid-template-columns: repeat(3, 1fr);
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
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
	}

	.stat-info { flex: 1; }

	.stat-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-smoke);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-ink);
		line-height: 1;
		letter-spacing: -0.02em;
	}

	/* Main Grid */
	.main-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.main-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.section-card {
		background: #ffffff;
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--color-ink);
		margin: 0;
	}

	.user-count-badge {
		font-size: 0.75rem;
		font-weight: 700;
		background: #f1f5f9;
		color: var(--color-carbon);
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		border: 1px solid #e2e8f0;
	}

	/* Distribution List - Number Only */
	.dist-chart {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.dist-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
		border-bottom: 1px solid #f1f5f9;
	}
	.dist-row:last-child {
		border-bottom: none;
	}

	.dist-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.dist-icon { font-size: 1.25rem; }

	.dist-role {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--color-ink);
	}

	.dist-count {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--color-ink);
	}

	/* Users Table - Flat */
	.users-table {
		display: flex;
		flex-direction: column;
	}

	.table-header-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-smoke);
		letter-spacing: 0.05em;
		border-bottom: 2px solid #e2e8f0;
		margin-bottom: 0.5rem;
	}

	.table-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.875rem 0;
		border-bottom: 1px solid #f1f5f9;
	}
	.table-row:last-child {
		border-bottom: none;
	}

	.table-username {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-ink);
	}

	.table-role-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.25rem 0.625rem;
		border-radius: 6px;
		text-transform: capitalize;
	}

	/* Timeline - Solid */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 500px;
		overflow-y: auto;
		padding-right: 1rem;
	}
	
	.timeline::-webkit-scrollbar { width: 4px; }
	.timeline::-webkit-scrollbar-track { background: transparent; }
	.timeline::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
	}

	.timeline-item {
		display: flex;
		gap: 1.25rem;
		padding: 1.25rem 0;
		border-bottom: 1px solid #f1f5f9;
		animation: slideUp 0.3s ease-out forwards;
		opacity: 0;
		position: relative;
	}

	.timeline-item::before {
		content: '';
		position: absolute;
		left: 5px; /* center of 10px dot */
		top: 2.75rem;
		bottom: 0;
		width: 2px;
		background: #e2e8f0;
		z-index: 0;
	}

	.timeline-item:last-child::before { display: none; }
	.timeline-item:last-child { border-bottom: none; }

	.timeline-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-top: 0.35rem;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
		border: 2px solid #ffffff;
	}

	.timeline-content { flex: 1; min-width: 0; }

	.timeline-top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.timeline-action {
		font-size: 0.875rem;
		font-weight: 800;
		color: var(--color-ink);
	}

	.timeline-time {
		font-size: 0.6875rem;
		color: var(--color-smoke);
		font-weight: 600;
		white-space: nowrap;
	}

	.timeline-detail {
		margin: 0 0 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-smoke);
		line-height: 1.5;
	}

	.timeline-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.timeline-user {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-smoke);
	}

	.timeline-role-badge {
		font-size: 0.5625rem;
		font-weight: 700;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Role Badge Colors - Flat Solid */
	.badge-petani { background: #dcfce7; color: #166534; }
	.badge-umkm { background: #e0f2fe; color: #075985; }
	.badge-admin { background: #f1f5f9; color: #334155; }
	
	.timeline-dot.badge-petani { background: #22c55e; }
	.timeline-dot.badge-umkm { background: #0ea5e9; }
	.timeline-dot.badge-admin { background: #64748b; }

	.empty-text {
		color: var(--color-smoke);
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		padding: 2rem 0;
	}

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
