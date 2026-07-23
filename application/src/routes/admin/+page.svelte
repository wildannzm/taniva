<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	import { activityLog, getActivitySummary } from '$lib/stores/activityLog.js';

	let { data } = $props();

	userRole.set('admin');

	/** @type {{ totalUsers: number, todayActivities: number, roleDist: Record<string, number>, recentActivities: import('$lib/stores/activityLog.js').ActivityEntry[] }} */
	let summary = $state({ totalUsers: 0, todayActivities: 0, roleDist: {}, recentActivities: [] });
	/** @type {any[]} */
	let registeredUsers = $state([]);
	let now = $state(new Date());

	// Reactive: recalculate when activityLog changes
	$effect(() => {
		// Subscribe to changes
		const _entries = $activityLog;
		summary = getActivitySummary();

		// Load registered users
		try {
			registeredUsers = JSON.parse(localStorage.getItem('taniva_users') || '[]');
		} catch { registeredUsers = []; }
	});

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
	<!-- Hero Header -->
	<header class="dashboard-hero admin-hero">
		<div class="mesh-bg"></div>
		<div class="hero-content">
			<div class="hero-text animate-slide-up">
				<h1 class="page-title">Dashboard {data.user?.name || 'Admin'}</h1>
				<p class="page-subtitle">Pantau seluruh aktivitas ekosistem Taniva secara real-time.</p>
				<a href="/admin/impact" class="impact-link-btn">Lihat Smart Impact Dashboard →</a>
			</div>
			<div class="clock-badge animate-slide-up" style="animation-delay: 100ms;">
				<div class="clock-icon">🕐</div>
				<div class="clock-text">
					<span class="clock-time">{now.toLocaleTimeString('id-ID')}</span>
					<span class="clock-date">{now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
				</div>
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<div class="content-wrapper">
			<!-- Stats Overview -->
			<section class="stats-overview animate-fade-in-up" style="animation-delay: 200ms;">
				<div class="stat-card glass-card">
					<div class="stat-icon icon-users">👥</div>
					<div class="stat-info">
						<div class="stat-label">Pengguna Terdaftar</div>
						<div class="stat-value">{registeredUsers.length}</div>
					</div>
				</div>
				<div class="stat-card glass-card">
					<div class="stat-icon icon-today">📊</div>
					<div class="stat-info">
						<div class="stat-label">Aktivitas Hari Ini</div>
						<div class="stat-value">{summary.todayActivities}</div>
					</div>
				</div>
				<div class="stat-card glass-card">
					<div class="stat-icon icon-total">🔢</div>
					<div class="stat-info">
						<div class="stat-label">Total Log Aktivitas</div>
						<div class="stat-value">{$activityLog.length}</div>
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
							{#each Object.entries(summary.roleDist) as [role, count]}
								<div class="dist-row">
									<div class="dist-label">
										<span class="dist-icon">{roleIcon(role)}</span>
										<span class="dist-role">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
									</div>
									<div class="dist-bar-track">
										<div class="dist-bar-fill dist-bar-{role}" style="width: {(count / totalAll) * 100}%;"></div>
									</div>
									<span class="dist-count">{count}</span>
								</div>
							{/each}
							{#if Object.keys(summary.roleDist).length === 0}
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
		background: #faf9f5;
		font-family: var(--font-sans, system-ui, sans-serif);
		padding-bottom: 4rem;
	}

	/* Admin Hero - uses a distinct indigo-dark palette */
	.admin-hero {
		position: relative;
		background: #0f172a;
		padding: 3rem 1.5rem 6rem;
		overflow: hidden;
		color: #ffffff;
	}

	.mesh-bg {
		position: absolute;
		inset: -50%;
		background: 
			radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.6) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.5) 0%, transparent 50%),
			radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.4) 0%, transparent 50%);
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

	.hero-text { max-width: 450px; }

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
		margin: 0 0 1.5rem;
		line-height: 1.5;
	}

	.impact-link-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: rgba(255, 255, 255, 0.15);
		color: #ffffff;
		text-decoration: none;
		border-radius: 100px;
		font-weight: 600;
		font-size: 0.875rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(10px);
		transition: all 0.2s;
	}

	.impact-link-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.1);
	}

	.clock-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.75rem 1.25rem;
		border-radius: 16px;
	}

	.clock-icon { font-size: 1.5rem; }

	.clock-text {
		display: flex;
		flex-direction: column;
	}

	.clock-time {
		font-size: 1.125rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.clock-date {
		font-size: 0.6875rem;
		color: rgba(255, 255, 255, 0.7);
		font-weight: 600;
	}

	/* Main Content */
	.dashboard-main {
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.content-wrapper {
		margin-top: -3rem;
		position: relative;
		z-index: 10;
	}

	/* Stats */
	.stats-overview {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 640px) {
		.stats-overview {
			grid-template-columns: repeat(3, 1fr);
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
		box-shadow: 0 12px 40px rgba(99, 102, 241, 0.1);
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

	.icon-users { background: #ede9fe; }
	.icon-today { background: #dbeafe; }
	.icon-total { background: #fce7f3; }

	.stat-info { flex: 1; }

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

	.user-count-badge {
		font-size: 0.75rem;
		font-weight: 700;
		background: #ede9fe;
		color: #6366f1;
		padding: 0.25rem 0.75rem;
		border-radius: 100px;
	}

	/* Distribution Chart */
	.dist-chart {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.dist-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.dist-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 5rem;
		flex-shrink: 0;
	}

	.dist-icon { font-size: 1.25rem; }

	.dist-role {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.dist-bar-track {
		flex: 1;
		height: 1.5rem;
		background: #f3f4f6;
		border-radius: 100px;
		overflow: hidden;
	}

	.dist-bar-fill {
		height: 100%;
		border-radius: 100px;
		transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
		min-width: 1rem;
	}

	.dist-bar-petani { background: linear-gradient(90deg, #22c55e, #16a34a); }
	.dist-bar-umkm { background: linear-gradient(90deg, #f59e0b, #d97706); }
	.dist-bar-admin { background: linear-gradient(90deg, #6366f1, #4f46e5); }

	.dist-count {
		font-size: 0.875rem;
		font-weight: 800;
		color: #111827;
		min-width: 2rem;
		text-align: right;
	}

	/* Users Table */
	.users-table {
		display: flex;
		flex-direction: column;
	}

	.table-header-row {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: #9ca3af;
		letter-spacing: 0.05em;
		border-bottom: 1px solid #f3f4f6;
	}

	.table-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-radius: 10px;
		transition: background 0.2s;
	}

	.table-row:hover { background: #f9fafb; }

	.table-username {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #111827;
	}

	.table-role-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: 100px;
		text-transform: capitalize;
	}

	/* Timeline */
	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0;
		max-height: 500px;
		overflow-y: auto;
	}

	.timeline-item {
		display: flex;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid #f3f4f6;
		animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}

	.timeline-item:last-child { border-bottom: none; }

	.timeline-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-top: 0.25rem;
		flex-shrink: 0;
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
		font-size: 0.9375rem;
		font-weight: 700;
		color: #111827;
	}

	.timeline-time {
		font-size: 0.6875rem;
		color: #9ca3af;
		font-weight: 600;
		white-space: nowrap;
	}

	.timeline-detail {
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		color: #6b7280;
		line-height: 1.4;
	}

	.timeline-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.timeline-user {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
	}

	.timeline-role-badge {
		font-size: 0.5625rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 100px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Role Badge Colors */
	.badge-petani { background: #dcfce7; color: #166534; }
	.badge-umkm { background: #fef3c7; color: #92400e; }
	.badge-admin { background: #ede9fe; color: #4338ca; }

	.empty-text {
		color: #9ca3af;
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem 0;
	}

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
