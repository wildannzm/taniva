<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	
	let { children, data } = $props();
	
	// Show nav only if not on the root landing page or login page
	let showNav = $derived($page.url.pathname !== '/' && $page.url.pathname !== '/login');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Taniva — Agri-Tech Trust Layer</title>
</svelte:head>

<div class="app-layout">
	{#if showNav}
		<header class="app-topbar">
			<div class="topbar-container">
				<a href={data.user ? `/${data.user.role === 'ADMIN' ? 'admin' : data.user.role === 'UMKM' ? 'umkm' : 'petani'}` : '/'} class="brand">
					<span class="brand-logo">🌿</span>
					<span class="brand-text">Taniva</span>
				</a>
				
				<div class="topbar-actions">
					{#if data.user}
						<span class="role-badge">
							{data.user.role === 'FARMER' ? '🧑‍🌾 Petani' : data.user.role === 'UMKM' ? '🍽️ UMKM' : '🛡️ Admin'}
						</span>
						<form action="/login?/logout" method="POST" style="margin:0; display:inline-flex;">
							<button type="submit" class="btn-logout" aria-label="Logout">
								Logout
							</button>
						</form>
					{/if}
				</div>
			</div>
		</header>
	{/if}

	<main class="app-main" class:with-nav={showNav}>
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--color-background);
	}

	.app-topbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3.5rem;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--color-outline-variant);
		z-index: 50;
	}

	.topbar-container {
		max-width: 1200px;
		margin: 0 auto;
		height: 100%;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
	}

	.brand-logo {
		font-size: 1.25rem;
	}

	.brand-text {
		font-weight: 700;
		font-size: 1.125rem;
		color: var(--color-primary);
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.role-badge {
		font-size: 0.65rem;
		font-weight: 600;
		background: var(--color-surface-container-high);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-full);
		color: var(--color-on-surface);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	@media (min-width: 480px) {
		.role-badge {
			font-size: 0.75rem;
			padding: 0.25rem 0.625rem;
		}
	}

	.btn-logout {
		background: #fee2e2;
		border: 1px solid #fca5a5;
		border-radius: 100px;
		font-size: 0.7rem;
		font-weight: 700;
		color: #dc2626;
		cursor: pointer;
		padding: 0.3rem 0.75rem;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		white-space: nowrap;
	}

	@media (min-width: 480px) {
		.btn-logout {
			font-size: 0.8125rem;
			padding: 0.4rem 1rem;
		}
	}

	.btn-logout:hover {
		background: #dc2626;
		color: white;
		border-color: #dc2626;
		box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
		transform: translateY(-1px);
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.app-main.with-nav {
		padding-top: 3.5rem; /* height of topbar */
	}
</style>
