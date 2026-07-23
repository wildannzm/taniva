<script>
	import { goto } from '$app/navigation';
	let { data } = $props();
</script>

<div class="landing-page">
	<!-- Acctual Navbar (Pill-Shaped Header Container) -->
	<div class="nav-wrapper">
		<nav class="acctual-nav">
			<div class="logo">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="logo-icon"><path d="M12 4L4 20h16L12 4z"/></svg>
				<span>Taniva</span>
			</div>
			<div class="nav-links">
				<a href="#features" class="nav-ghost">Platform</a>
				<a href="#how" class="nav-ghost">How it works</a>
				{#if data.user}
					<button class="btn-acctual-primary" onclick={() => goto(data.user?.role === 'ADMIN' ? '/admin' : data.user?.role === 'UMKM' ? '/umkm' : '/petani')}>Dashboard</button>
				{:else}
					<button class="nav-ghost" onclick={() => goto('/login')}>Log in</button>
					<button class="btn-acctual-primary" onclick={() => goto('/login')}>Get started</button>
				{/if}
			</div>
		</nav>
	</div>

	<!-- Acctual Hero Section (Paper on Frosted Glass) -->
	<header class="acctual-hero">
		<div class="hero-container">
			<div class="hero-text-block">
				<div class="hero-badge">
					<span class="badge-icon">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-electric-blue)"><circle cx="12" cy="12" r="10"/></svg>
					</span>
					Taniva 2.0 telah hadir
				</div>
				<h1 class="hero-title">
					Lapisan kepercayaan terpadu untuk pertanian lokal.
				</h1>
				<p class="hero-desc">
					Verifikasi kualitas panen seketika dengan AI dan simpan datanya secara aman. Cara termudah bagi Petani dan UMKM kuliner bertransaksi dengan keyakinan penuh.
				</p>
				<div class="hero-actions">
					{#if data.user}
						<button class="btn-acctual-primary btn-lg" onclick={() => goto(data.user?.role === 'ADMIN' ? '/admin' : data.user?.role === 'UMKM' ? '/umkm' : '/petani')}>Ke Dashboard</button>
					{:else}
						<button class="btn-acctual-primary btn-lg" onclick={() => goto('/login')}>Mulai Gratis</button>
					{/if}
					<button class="btn-acctual-secondary btn-lg" onclick={() => document.getElementById('features').scrollIntoView()}>Pelajari Fitur</button>
				</div>
				<div class="hero-rate-badge">
					<span class="rate-icon">✓</span>
					<span class="rate-text">Verifikasi AI <strong>99.8%</strong></span>
				</div>
			</div>
			
			<div class="hero-visual-block">
				<!-- Invoice/Certificate Mockup -->
				<div class="acctual-mockup-stack">
					<div class="mockup-bg"></div>
					<div class="acctual-card">
						<div class="acctual-card-header">
							<span class="eyebrow">NO SERTIFIKAT</span>
							<span class="eyebrow-val">TV-092A-881</span>
						</div>
						<div class="acctual-card-body">
							<div class="vendor-block">
								<div class="vendor-icon icon-iris">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
								</div>
								<div class="vendor-info">
									<span class="v-label">DARI</span>
									<span class="v-name">Pak Yanto (Grade A)</span>
								</div>
							</div>
							<div class="divider"></div>
							<table class="acctual-table">
								<tbody>
									<tr>
										<td class="t-label">Jenis Panen</td>
										<td class="t-val">Beras Rojolele</td>
									</tr>
									<tr>
										<td class="t-label">Skor AI</td>
										<td class="t-val"><span class="chip-leaf">98/100</span></td>
									</tr>
									<tr>
										<td class="t-label">ID Verifikasi</td>
										<td class="t-val t-mono">TV-9C4A...7F2B</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features Section -->
	<section id="features" class="acctual-features">
		<div class="acctual-section-container">
			<div class="acctual-section-header">
				<h2 class="acctual-section-title">Kenapa Memilih Taniva?</h2>
				<p class="acctual-section-subtitle">Kami membawa transparansi penuh ke dalam rantai pasok pertanian lokal Anda.</p>
			</div>
			
			<div class="acctual-features-grid">
				<div class="acctual-feature-card">
					<div class="acctual-feature-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M5 10h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M8 18h8"/></svg>
					</div>
					<h3 class="acctual-feature-title">Computer Vision AI</h3>
					<p class="acctual-feature-desc">Tidak perlu lagi menebak kualitas. AI kami memindai dan memberikan skor objektivitas kualitas hasil panen secara otomatis.</p>
				</div>
				<div class="acctual-feature-card">
					<div class="acctual-feature-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
					</div>
					<h3 class="acctual-feature-title">Jejak Digital Aman</h3>
					<p class="acctual-feature-desc">Setiap panen dicatat ke dalam sistem terpusat. UMKM dapat memindai QR code untuk memverifikasi orisinalitas langsung dari kebun.</p>
				</div>
				<div class="acctual-feature-card">
					<div class="acctual-feature-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
					</div>
					<h3 class="acctual-feature-title">Reputasi Terpercaya</h3>
					<p class="acctual-feature-desc">Bangun rekam jejak yang solid. Petani berkualitas akan selalu direkomendasikan kepada UMKM yang mencari bahan baku terbaik.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section id="how" class="acctual-how">
		<div class="acctual-large-panel">
			<div class="acctual-section-header">
				<h2 class="acctual-section-title">Cara Kerja Ekosistem</h2>
			</div>
			
			<div class="acctual-steps">
				<div class="acctual-step">
					<div class="step-num">1</div>
					<h4>Unggah Foto Panen</h4>
					<p>AI memproses foto untuk menghasilkan skor kualitas seketika.</p>
				</div>
				<div class="acctual-step">
					<div class="step-num">2</div>
					<h4>Sertifikat Digital</h4>
					<p>Sistem merilis QR Code sebagai bukti otentik yang terverifikasi.</p>
				</div>
				<div class="acctual-step">
					<div class="step-num">3</div>
					<h4>Terima & Verifikasi</h4>
					<p>UMKM memindai QR Code untuk cek kualitas dan memberikan rating.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="acctual-cta-section">
		<div class="acctual-cta-box">
			<h2 class="cta-title">Tingkatkan Standar Bisnis Anda</h2>
			<p class="cta-desc">Bergabunglah dengan ribuan Petani dan UMKM di Solo Raya yang telah menggunakan Taniva.</p>
			<button class="btn-cta-green" onclick={() => goto('/login')}>Daftar Gratis Sekarang</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="acctual-footer">
		<div class="footer-content">
			<div class="footer-logo">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 4L4 20h16L12 4z"/></svg>
				<span>Taniva</span>
			</div>
			<div class="footer-links">
				<a href="#features">Platform</a>
				<a href="#how">How it works</a>
				<a href="/login">Log in</a>
			</div>
			<div class="footer-copy">© 2026 Taniva Agri-Tech. All rights reserved.</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: var(--font-sans, system-ui, sans-serif);
		background: #faf9f5;
		scroll-behavior: smooth;
	}

	.landing-page {
		width: 100%;
		overflow-x: hidden;
	}

	/* ── Acctual Nav ───────────────────────── */
	.nav-wrapper {
		position: fixed;
		top: 24px;
		left: 0;
		width: 100%;
		display: flex;
		justify-content: center;
		z-index: 100;
		padding: 0 24px;
	}

	.acctual-nav {
		background: var(--color-paper);
		border-radius: 100px;
		box-shadow: var(--shadow-subtle-2);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px 8px 24px;
		width: 100%;
		max-width: 900px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 16px;
		color: var(--color-ink);
		letter-spacing: -0.02em;
	}

	.logo-icon {
		color: var(--color-ink);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.nav-ghost {
		background: transparent;
		color: var(--color-ink);
		border: none;
		border-radius: 100px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.2s;
	}

	.nav-ghost:hover {
		background: var(--color-snow);
	}

	.btn-acctual-primary {
		background: var(--color-midnight);
		color: var(--color-paper);
		border: none;
		border-radius: 100px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		box-shadow: var(--shadow-subtle-2);
		transition: opacity 0.2s;
	}

	.btn-acctual-primary:hover {
		opacity: 0.9;
	}

	/* ── Acctual Hero ──────────────────────── */
	.acctual-hero {
		background: var(--color-paper);
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding: 140px 24px 80px;
		overflow: hidden;
	}

	.hero-container {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr;
		gap: 64px;
		align-items: center;
		width: 100%;
	}

	@media (min-width: 1024px) {
		.hero-container {
			grid-template-columns: 1fr 1fr;
		}
	}

	.hero-text-block {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: var(--color-snow);
		border: 1px solid var(--color-mist);
		border-radius: 100px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 24px;
	}

	.hero-title {
		font-size: clamp(40px, 6vw, 64px);
		font-weight: 600;
		color: var(--color-ink);
		line-height: 1.13;
		letter-spacing: -0.03em;
		margin: 0 0 24px;
	}

	.hero-desc {
		font-size: 20px;
		color: var(--color-smoke);
		line-height: 1.5;
		margin: 0 0 40px;
		max-width: 480px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.btn-lg {
		padding: 12px 24px;
		font-size: 16px;
	}

	.btn-acctual-secondary {
		background: var(--color-carbon);
		color: var(--color-paper);
		border: none;
		border-radius: 100px;
		font-weight: 500;
		cursor: pointer;
		box-shadow: var(--shadow-subtle-2);
		transition: opacity 0.2s;
	}

	.btn-acctual-secondary:hover {
		opacity: 0.9;
	}

	.hero-rate-badge {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.rate-icon {
		background: var(--color-electric-blue);
		color: white;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: bold;
	}

	.rate-text {
		color: var(--color-ink);
		font-size: 14px;
		font-weight: 500;
	}

	/* ── Acctual Mockup ────────────────────── */
	.hero-visual-block {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.acctual-mockup-stack {
		position: relative;
		width: 100%;
		max-width: 440px;
		transform: rotate(-2deg);
		transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.acctual-mockup-stack:hover {
		transform: rotate(0deg) translateY(-8px);
	}

	.mockup-bg {
		position: absolute;
		top: 16px;
		left: 16px;
		right: -16px;
		bottom: -16px;
		background: var(--color-ice);
		border-radius: 20px;
		z-index: 0;
	}

	.acctual-card {
		background: var(--color-paper);
		border-radius: 20px;
		box-shadow: var(--shadow-elevated);
		position: relative;
		z-index: 1;
		overflow: hidden;
	}

	.acctual-card-header {
		padding: 24px;
		border-bottom: 1px solid var(--color-mist);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.eyebrow {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-smoke);
		letter-spacing: 0.02em;
	}

	.eyebrow-val {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-ink);
	}

	.acctual-card-body {
		padding: 24px;
	}

	.vendor-block {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 24px;
	}

	.vendor-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
	
	.icon-iris { background: var(--color-iris); }

	.vendor-info {
		display: flex;
		flex-direction: column;
	}

	.v-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-smoke);
		letter-spacing: 0.02em;
		margin-bottom: 2px;
	}

	.v-name {
		font-size: 16px;
		font-weight: 500;
		color: var(--color-ink);
	}

	.divider {
		height: 1px;
		background: var(--color-mist);
		margin: 24px 0;
	}

	.acctual-table {
		width: 100%;
		border-collapse: collapse;
	}

	.acctual-table td {
		padding: 12px 0;
		border-bottom: 1px solid var(--color-mist);
	}

	.acctual-table tr:last-child td {
		border-bottom: none;
	}

	.t-label {
		color: var(--color-smoke);
		font-size: 14px;
		font-weight: 500;
	}

	.t-val {
		color: var(--color-ink);
		font-size: 14px;
		font-weight: 500;
		text-align: right;
	}

	.t-mono {
		font-family: monospace;
		color: var(--color-fog);
	}

	.chip-leaf {
		background: var(--color-leaf);
		color: white;
		padding: 2px 8px;
		border-radius: 100px;
		font-size: 12px;
		font-weight: 600;
	}

	/* ── Acctual Sections Common ────────────────────────────── */
	.acctual-section-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 96px 24px;
	}

	.acctual-section-header {
		text-align: center;
		margin-bottom: 64px;
	}

	.acctual-section-title {
		font-size: clamp(32px, 4vw, 48px);
		font-weight: 600;
		color: var(--color-ink);
		letter-spacing: -0.03em;
		margin: 0 0 16px;
		line-height: 1.17;
	}

	.acctual-section-subtitle {
		font-size: 20px;
		color: var(--color-smoke);
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.5;
		font-weight: 500;
	}

	/* ── Acctual Features ───────────────────────────────────── */
	.acctual-features {
		background: var(--color-snow);
	}

	.acctual-features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.acctual-feature-card {
		background: var(--color-paper);
		border-radius: 16px;
		padding: 32px;
		transition: transform 0.2s;
	}

	.acctual-feature-card:hover {
		transform: translateY(-2px);
	}

	.acctual-feature-icon {
		background: rgba(27, 94, 32, 0.08); /* Pale green wash */
		color: #1b5e20; /* Green accent */
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24px;
	}

	.acctual-feature-title {
		font-size: 24px;
		font-weight: 600;
		color: var(--color-ink);
		letter-spacing: -0.03em;
		margin: 0 0 12px;
	}

	.acctual-feature-desc {
		font-size: 16px;
		color: var(--color-smoke);
		line-height: 1.5;
		margin: 0;
		font-weight: 500;
	}

	/* ── Acctual How It Works ───────────────────────────────── */
	.acctual-how {
		background: var(--color-paper);
		padding: 96px 24px;
	}

	.acctual-large-panel {
		background: var(--color-snow);
		border-radius: 32px;
		padding: 80px 48px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.acctual-steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 40px;
	}

	.acctual-step {
		display: flex;
		flex-direction: column;
	}

	.step-num {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-paper);
		border: 1px solid var(--color-mist);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 600;
		color: var(--color-ink);
		margin-bottom: 24px;
	}

	.acctual-step h4 {
		font-size: 20px;
		font-weight: 600;
		color: var(--color-ink);
		letter-spacing: -0.02em;
		margin: 0 0 12px;
	}

	.acctual-step p {
		font-size: 16px;
		color: var(--color-smoke);
		line-height: 1.5;
		margin: 0;
		font-weight: 500;
	}

	/* ── Acctual CTA ────────────────────────────────────────── */
	.acctual-cta-section {
		padding: 0 24px 96px;
		background: var(--color-paper);
	}

	.acctual-cta-box {
		background: var(--color-midnight);
		border-radius: 32px;
		padding: 80px 24px;
		text-align: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.cta-title {
		font-size: clamp(32px, 5vw, 48px);
		font-weight: 600;
		color: var(--color-paper);
		letter-spacing: -0.03em;
		margin: 0 0 24px;
	}

	.cta-desc {
		font-size: 20px;
		color: var(--color-concrete);
		max-width: 500px;
		margin: 0 auto 40px;
		line-height: 1.5;
		font-weight: 500;
	}

	.btn-cta-green {
		background: #1b5e20; /* Green accent CTA */
		color: var(--color-paper);
		border: none;
		border-radius: 100px;
		padding: 16px 32px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-cta-green:hover {
		background: #144d18;
	}

	/* ── Acctual Footer ─────────────────────────────────────── */
	.acctual-footer {
		background: var(--color-snow);
		border-top: 1px solid var(--color-mist);
		padding: 64px 24px;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
	}

	.footer-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 20px;
		color: var(--color-ink);
		letter-spacing: -0.02em;
	}

	.footer-links {
		display: flex;
		gap: 32px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.footer-links a {
		color: var(--color-smoke);
		text-decoration: none;
		font-size: 16px;
		font-weight: 500;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: var(--color-ink);
	}

	.footer-copy {
		color: var(--color-fog);
		font-size: 14px;
		font-weight: 500;
	}

	/* Animations */
	.animate-fade-in-up {
		animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		opacity: 0;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(40px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.animate-float-1 { animation: float 6s ease-in-out infinite; }
	.animate-float-2 { animation: float 7s ease-in-out infinite 1s; }
	.animate-float-3 { animation: float 8s ease-in-out infinite 2s; }

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-20px); }
	}
</style>
