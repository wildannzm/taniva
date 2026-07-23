<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userRole } from '$lib/stores/app.js';
	import { logActivity } from '$lib/stores/activityLog.js';
	
	let authMode = $state('login'); // 'login' | 'register'
	let username = $state('');
	let password = $state('');
	
	/** @type {'petani'|'umkm'} */
	let selectedRole = $state('petani'); 
	let isAuthenticating = $state(false);
	let errorMsg = $state('');

	onMount(() => {
		// Seeding is now handled by Prisma (prisma/seed.js)
	});

	/** @param {'login' | 'register'} mode */
	function toggleMode(mode) {
		authMode = mode;
		errorMsg = '';
		username = '';
		password = '';
	}

	function handleAuth() {
		errorMsg = '';
		if (username.trim().length < 3 || password.length < 3) {
			errorMsg = 'Username dan password minimal 3 karakter.';
			return;
		}

		isAuthenticating = true;
		
		setTimeout(() => {
			isAuthenticating = false;
			
			/** @type {any[]} */
			const users = JSON.parse(localStorage.getItem('taniva_users') || '[]');

			if (authMode === 'register') {
				if (users.find(u => u.username === username)) {
					errorMsg = 'Username sudah terdaftar.';
					return;
				}
				users.push({ username, password, role: selectedRole });
				localStorage.setItem('taniva_users', JSON.stringify(users));
				userRole.set(selectedRole);
				logActivity({ role: selectedRole, username, action: 'Register', detail: `Akun baru dibuat sebagai ${selectedRole}` });
				goto(`/${selectedRole}`);
			} else {
				const user = users.find(u => u.username === username && u.password === password);
				if (user) {
					userRole.set(user.role);
					logActivity({ role: user.role, username: user.username, action: 'Login', detail: `${user.username} login ke sistem` });
					goto(`/${user.role}`);
				} else {
					errorMsg = 'Username atau kata sandi salah.';
				}
			}
		}, 1200);
	}
</script>

<div class="split-layout">
	<!-- Left Side: Visual/Brand -->
	<div class="brand-panel">
		<div class="mesh-bg"></div>
		<div class="brand-content animate-slide-up-slow">
			<div class="logo-badge">🌿 Taniva</div>
			<h1 class="brand-title">Agri-Tech<br/>Trust Layer<br/>Solo Raya</h1>
			<p class="brand-subtitle">Ekosistem terpadu untuk memastikan kualitas panen dan membangun kepercayaan antara Petani dan UMKM.</p>
		</div>
	</div>

	<!-- Right Side: Auth Form -->
	<div class="auth-panel">
		<div class="auth-container animate-fade-in-up">
			
			<div class="tabs-container">
				<div class="tabs-bg">
					<button class="tab-btn {authMode === 'login' ? 'active' : ''}" onclick={() => toggleMode('login')}>Masuk</button>
					<button class="tab-btn {authMode === 'register' ? 'active' : ''}" onclick={() => toggleMode('register')}>Daftar</button>
					<div class="tab-indicator {authMode}"></div>
				</div>
			</div>

			<div class="auth-header">
				<h2>{authMode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda'}</h2>
				<p>{authMode === 'login' ? 'Masuk ke ekosistem Taniva.' : 'Buat akun Taniva dalam hitungan detik.'}</p>
			</div>

			<form class="auth-form" onsubmit={(e) => { e.preventDefault(); handleAuth(); }}>
				{#if errorMsg}
					<div class="error-toast animate-shake">
						<span class="error-icon">⚠</span>
						<span>{errorMsg}</span>
					</div>
				{/if}

				<div class="input-container">
					<input type="text" id="username" bind:value={username} required placeholder=" " />
					<label for="username">Username / No. HP</label>
					<div class="input-line"></div>
				</div>

				<div class="input-container">
					<input type="password" id="password" bind:value={password} required placeholder=" " />
					<label for="password">Kata Sandi</label>
					<div class="input-line"></div>
				</div>




				<button type="submit" class="submit-btn {isAuthenticating ? 'loading' : ''}" disabled={isAuthenticating || username.trim().length < 3 || password.length < 3}>
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
	}

	.split-layout {
		display: flex;
		min-height: 100dvh;
		background: #ffffff;
		overflow: hidden;
	}

	/* Left Panel */
	.brand-panel {
		display: none;
		flex: 1.2;
		position: relative;
		overflow: hidden;
		background: #0a2e11;
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

	.mesh-bg {
		position: absolute;
		inset: -50%;
		background: 
			radial-gradient(circle at 20% 30%, rgba(27, 94, 32, 0.8) 0%, transparent 50%),
			radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.6) 0%, transparent 50%),
			radial-gradient(circle at 50% 10%, rgba(139, 195, 74, 0.4) 0%, transparent 50%);
		filter: blur(80px);
		animation: pulseBg 15s ease-in-out infinite alternate;
		z-index: 0;
	}

	@keyframes pulseBg {
		0% { transform: scale(1) translate(0, 0); }
		100% { transform: scale(1.1) translate(-5%, 5%); }
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
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		background: #ffffff;
		position: relative;
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
	}

	.tabs-container {
		display: flex;
		justify-content: center;
		margin-bottom: 3rem;
	}

	.tabs-bg {
		display: flex;
		background: #f4f4f0;
		border-radius: 100px;
		padding: 4px;
		position: relative;
		width: 100%;
		max-width: 280px;
	}

	.tab-btn {
		flex: 1;
		padding: 0.75rem 1.5rem;
		border: none;
		background: transparent;
		font-weight: 600;
		font-size: 0.9375rem;
		color: #71716e;
		cursor: pointer;
		position: relative;
		z-index: 2;
		transition: color 0.3s;
	}

	.tab-btn.active {
		color: #1b5e20;
	}

	.tab-indicator {
		position: absolute;
		top: 4px;
		bottom: 4px;
		width: calc(50% - 4px);
		background: #ffffff;
		border-radius: 100px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		z-index: 1;
		transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.26, 1.55);
	}

	.tab-indicator.login {
		transform: translateX(0);
	}

	.tab-indicator.register {
		transform: translateX(100%);
	}

	.auth-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.auth-header h2 {
		font-size: 1.875rem;
		font-weight: 800;
		color: #1c1c1a;
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
	}

	.auth-header p {
		font-size: 0.9375rem;
		color: #71716e;
		margin: 0;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-container {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.input-container input {
		width: 100%;
		padding: 1.25rem 1rem 0.5rem;
		border: none;
		background: #f8f9fa;
		border-radius: 12px 12px 0 0;
		font-size: 1rem;
		color: #1c1c1a;
		transition: background 0.3s;
		box-sizing: border-box;
	}

	.input-container input:focus {
		outline: none;
		background: #e8f5e9;
	}

	.input-container label {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1rem;
		color: #71716e;
		pointer-events: none;
		transition: all 0.2s ease;
	}

	.input-container input:focus + label,
	.input-container input:not(:placeholder-shown) + label {
		top: 0.5rem;
		transform: translateY(0);
		font-size: 0.75rem;
		font-weight: 600;
		color: #1b5e20;
	}

	.input-line {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: #dadad6;
		transition: all 0.3s;
	}

	.input-container input:focus ~ .input-line {
		background: #1b5e20;
		height: 3px;
	}

	.role-selector {
		margin-top: 0.5rem;
	}

	.role-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1c1c1a;
		margin: 0 0 1rem;
	}

	.role-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	@media (min-width: 480px) {
		.role-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 1rem;
		}
	}

	.role-card {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		border-radius: 16px;
		border: 2px solid #f4f4f0;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.role-card input {
		display: none;
	}

	.role-card:hover {
		border-color: #a5d6a7;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.08);
	}

	.role-card.selected {
		border-color: #1b5e20;
		background: #f2fcf3;
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.12);
	}

	.role-icon {
		font-size: 1.75rem;
		background: #f4f4f0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12px;
		transition: background 0.3s;
		flex-shrink: 0;
	}

	.role-card.selected .role-icon {
		background: #ffffff;
	}

	.role-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.role-title {
		font-weight: 700;
		color: #1c1c1a;
		font-size: 1rem;
	}

	.role-desc {
		font-size: 0.75rem;
		color: #71716e;
	}

	.role-card.selected .role-title {
		color: #1b5e20;
	}

	.check-circle {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid #dadad6;
		transition: all 0.3s;
		box-sizing: border-box;
	}

	.role-card.selected .check-circle {
		border-color: #1b5e20;
		background: #1b5e20;
	}

	.role-card.selected .check-circle::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 2px;
		width: 4px;
		height: 8px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.submit-btn {
		position: relative;
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
		color: #ffffff;
		border: none;
		border-radius: 100px;
		font-size: 1.0625rem;
		font-weight: 700;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.25);
	}

	.submit-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
		opacity: 0;
		transition: opacity 0.3s;
		z-index: 0;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.35);
	}

	.submit-btn:hover:not(:disabled)::before {
		opacity: 1;
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
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
		width: 1.5rem;
		height: 1.5rem;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #ffffff;
		animation: spin 0.8s linear infinite;
		z-index: 2;
	}

	@keyframes spin {
		to { transform: translate(-50%, -50%) rotate(360deg); }
	}

	.error-toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #ffebee;
		color: #d32f2f;
		padding: 1rem;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 500;
		border-left: 4px solid #d32f2f;
	}

	.error-icon {
		font-size: 1.25rem;
	}

	/* Animations */
	.animate-fade-in-up {
		animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-slide-up-slow {
		animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-expand {
		animation: expandY 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		overflow: hidden;
	}

	.animate-shake {
		animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(30px); }
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
