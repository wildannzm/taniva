<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	
	let { form } = $props();

	let authMode = $state('login'); // 'login' | 'register'
	let name = $state(String(form?.name || ''));
	let email = $state(String(form?.email || ''));
	let password = $state('');
	let role = $state('petani');
	let isAuthenticating = $state(false);

	onMount(() => {
		// Seeding is now handled by Prisma (prisma/seed.js)
	});

	/** @param {'login' | 'register'} mode */
	function toggleMode(mode) {
		authMode = mode;
		name = '';
		email = '';
		password = '';
		role = 'petani';
	}
</script>

<div class="split-layout">
	<!-- Left Side: Visual/Brand -->
	<div class="brand-panel">
		<div class="brand-content animate-slide-up-slow">
			<div class="logo-badge">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4L4 20h16L12 4z"/></svg>
				Taniva
			</div>
			<h1 class="brand-title">Agri-Tech<br/>Trust Layer<br/>Solo Raya</h1>
			<p class="brand-subtitle">Ekosistem terpadu untuk memastikan kualitas panen dan membangun kepercayaan antara Petani dan UMKM.</p>
		</div>
	</div>

	<!-- Right Side: Auth Form -->
	<div class="auth-panel">
		<div class="auth-card animate-fade-in-up">
			<div class="auth-header">
				<h2>{authMode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}</h2>
				<p>{authMode === 'login' ? 'Masuk ke sistem kepercayaan terpadu Taniva.' : 'Buat akun Taniva dalam hitungan detik.'}</p>
			</div>

			<div class="tabs-container">
				<button class="tab-btn {authMode === 'login' ? 'active' : ''}" onclick={() => toggleMode('login')}>Masuk</button>
				<button class="tab-btn {authMode === 'register' ? 'active' : ''}" onclick={() => toggleMode('register')}>Daftar</button>
			</div>

			<form class="auth-form" method="POST" action="?/{authMode}" use:enhance={() => {
				isAuthenticating = true;
				return async ({ update }) => {
					await update();
					isAuthenticating = false;
				};
			}}>
				{#if form?.error}
					<div class="error-toast animate-shake">
						<span class="error-icon">⚠</span>
						<span>{form.error}</span>
					</div>
				{/if}

				{#if authMode === 'register'}
					<div class="input-group animate-expand">
						<label for="name">Nama Lengkap</label>
						<input type="text" id="name" name="name" bind:value={name} required={authMode === 'register'} />
					</div>
				{/if}

				<div class="input-group">
					<label for="email">Email</label>
					<input type="email" id="email" name="email" bind:value={email} required />
				</div>

				<div class="input-group">
					<label for="password">Kata Sandi</label>
					<input type="password" id="password" name="password" bind:value={password} required />
				</div>

				{#if authMode === 'register'}
					<div class="role-selector">
						<p class="role-label">Pilih Peran Anda</p>
						<div class="role-grid">
							<label class="role-card {role === 'petani' ? 'selected' : ''}">
								<input type="radio" name="role" value="petani" bind:group={role} required>
								<div class="role-text">
									<span class="role-title">Petani</span>
								</div>
							</label>
							<label class="role-card {role === 'umkm' ? 'selected' : ''}">
								<input type="radio" name="role" value="umkm" bind:group={role} required>
								<div class="role-text">
									<span class="role-title">UMKM</span>
								</div>
							</label>
						</div>
					</div>
				{/if}

				<button type="submit" class="submit-btn {isAuthenticating ? 'loading' : ''}" disabled={isAuthenticating}>
					<span class="btn-text">{authMode === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}</span>
					{#if isAuthenticating}
						<div class="spinner"></div>
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: var(--font-sans, system-ui, sans-serif);
		background: var(--color-snow);
	}

	.split-layout {
		display: flex;
		min-height: 100dvh;
		background: var(--color-snow);
		overflow: hidden;
	}

	/* Left Panel */
	.brand-panel {
		display: none;
		flex: 1;
		position: relative;
		overflow: hidden;
		background: linear-gradient(135deg, #0a1f11 0%, #1b5e20 100%);
		color: white;
		padding: 4rem;
	}

	@media (min-width: 900px) {
		.brand-panel {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}
	}

	.brand-content {
		position: relative;
		z-index: 1;
		max-width: 480px;
	}

	.logo-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		padding: 0.5rem 1rem;
		border-radius: 100px;
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.brand-title {
		font-size: 3.5rem;
		font-weight: 800;
		line-height: 1.1;
		margin: 0 0 1.5rem;
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, #ffffff 0%, #a5d6a7 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.brand-subtitle {
		font-size: 1.125rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
	}

	/* Right Panel */
	.auth-panel {
		flex: 1.2;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		background: var(--color-snow);
		position: relative;
	}

	.auth-card {
		background: var(--color-paper);
		border-radius: 24px;
		box-shadow: var(--shadow-elevated);
		width: 100%;
		max-width: 440px;
		padding: 48px;
		position: relative;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.auth-header h2 {
		font-size: 24px;
		font-weight: 600;
		color: var(--color-ink);
		margin: 0 0 8px;
		letter-spacing: -0.03em;
	}

	.auth-header p {
		font-size: 14px;
		color: var(--color-smoke);
		margin: 0;
		font-weight: 500;
	}

	.tabs-container {
		display: flex;
		background: var(--color-snow);
		border-radius: 100px;
		padding: 4px;
		margin-bottom: 32px;
		border: 1px solid var(--color-mist);
	}

	.tab-btn {
		flex: 1;
		padding: 8px 16px;
		border: none;
		background: transparent;
		font-weight: 600;
		font-size: 14px;
		color: var(--color-smoke);
		border-radius: 100px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-btn.active {
		background: var(--color-paper);
		color: var(--color-ink);
		box-shadow: var(--shadow-subtle);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.input-group label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.input-group input {
		width: 100%;
		padding: 12px 16px;
		background: var(--color-snow);
		border: 1px solid var(--color-mist);
		border-radius: 12px;
		font-size: 14px;
		color: var(--color-ink);
		transition: all 0.2s;
		box-sizing: border-box;
	}

	.input-group input:focus {
		outline: none;
		border-color: #1b5e20;
		background: var(--color-paper);
		box-shadow: 0 0 0 4px rgba(27, 94, 32, 0.1);
	}

	.role-selector {
		margin-top: 8px;
	}

	.role-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-ink);
		text-transform: uppercase;
		letter-spacing: 0.02em;
		margin: 0 0 8px;
	}

	.role-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.role-card {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		border-radius: 12px;
		border: 1px solid var(--color-mist);
		background: var(--color-snow);
		cursor: pointer;
		transition: all 0.2s;
	}

	.role-card input {
		display: none;
	}

	.role-card:hover {
		border-color: #1b5e20;
	}

	.role-card.selected {
		border-color: #1b5e20;
		background: #e8f5e9;
		color: #1b5e20;
	}

	.role-title {
		font-weight: 600;
		font-size: 14px;
	}

	.submit-btn {
		position: relative;
		margin-top: 12px;
		padding: 14px;
		background: #1b5e20;
		color: var(--color-paper);
		border: none;
		border-radius: 100px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(27, 94, 32, 0.2);
	}

	.submit-btn:hover:not(:disabled) {
		background: #144517;
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(27, 94, 32, 0.3);
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-text {
		position: relative;
		z-index: 1;
	}

	.submit-btn.loading .btn-text {
		opacity: 0;
	}

	.spinner {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #ffffff;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: translate(-50%, -50%) rotate(360deg); }
	}

	.error-toast {
		display: flex;
		align-items: center;
		gap: 8px;
		background: #ffebee;
		color: #d32f2f;
		padding: 12px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 500;
	}

	/* Animations */
	.animate-fade-in-up {
		animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-slide-up-slow {
		animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-expand {
		animation: expandY 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		overflow: hidden;
	}

	.animate-shake {
		animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes expandY {
		from { opacity: 0; max-height: 0; transform: translateY(-10px); }
		to { opacity: 1; max-height: 200px; transform: translateY(0); }
	}

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
