<script>
	import { goto } from '$app/navigation';
	let { data } = $props();
</script>

<div class="landing-page">
	<!-- Navbar -->
	<nav class="navbar">
		<div class="nav-content">
			<div class="logo">🌿 Taniva</div>
			<div class="nav-links">
				{#if data.user}
					<button class="btn-login" onclick={() => goto(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'UMKM' ? '/umkm' : '/petani')}>Dashboard</button>
				{:else}
					<button class="btn-login" onclick={() => goto('/login')}>Masuk / Daftar</button>
				{/if}
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<header class="hero-section">
		<div class="mesh-bg"></div>
		
		<div class="hero-container">
			<div class="hero-content">
				<div class="hero-badge animate-fade-in-up">
					<span class="pulse-dot"></span> Inovasi Pertanian Digital
				</div>
				<h1 class="hero-title animate-fade-in-up" style="animation-delay: 100ms;">
					Agri-Tech Trust Layer <br/>
					<span class="text-gradient">Solo Raya</span>
				</h1>
				<p class="hero-desc animate-fade-in-up" style="animation-delay: 200ms;">
					Ekosistem terpadu berbasis <strong>AI & Blockchain</strong> untuk memastikan kualitas panen dan membangun kepercayaan mutlak antara Petani dan UMKM kuliner.
				</p>
				
				<div class="hero-actions animate-fade-in-up" style="animation-delay: 300ms;">
					{#if data.user}
						<button class="btn-primary" onclick={() => goto(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'UMKM' ? '/umkm' : '/petani')}>
							Dashboard
							<span class="arrow">→</span>
						</button>
					{:else}
						<button class="btn-primary" onclick={() => goto('/login')}>
							Mulai Sekarang
							<span class="arrow">→</span>
						</button>
					{/if}
					<a href="#features" class="btn-secondary">Pelajari Lebih Lanjut</a>
				</div>
			</div>
			
			<div class="hero-visual animate-fade-in-up" style="animation-delay: 400ms;">
				<div class="mockup-window">
					<div class="glow-effect"></div>
					<div class="mockup-header">
						<div class="dot" style="background:#ff5f56"></div>
						<div class="dot" style="background:#ffbd2e"></div>
						<div class="dot" style="background:#27c93f"></div>
					</div>
					<div class="mockup-body">
						<div class="m-title">Sistem Verifikasi Otomatis</div>
						<div class="mockup-card top-card animate-float-1">
							<div class="mc-icon">🤖</div>
							<div class="mc-info">
								<span class="mc-label">Grading AI Selesai</span>
								<span class="mc-val text-green">Skor 98/100 (Grade A)</span>
							</div>
						</div>
						<div class="mockup-card middle-card animate-float-2">
							<div class="mc-icon">⛓️</div>
							<div class="mc-info">
								<span class="mc-label">Sertifikat Blockchain</span>
								<span class="mc-val font-mono">0x7F2...9C4A</span>
							</div>
						</div>
						<div class="mockup-card bottom-card animate-float-3">
							<div class="mc-icon">⭐</div>
							<div class="mc-info">
								<span class="mc-label">Reputasi Otomatis</span>
								<span class="mc-val">Skor Petani Naik +5</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features Section -->
	<section id="features" class="features-section">
		<div class="section-container">
			<div class="section-header">
				<h2 class="section-title">Kenapa Memilih Taniva?</h2>
				<p class="section-subtitle">Kami membawa transparansi penuh ke dalam rantai pasok pertanian lokal Anda.</p>
			</div>
			
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🤖</div>
					<h3 class="feature-title">Computer Vision AI</h3>
					<p class="feature-desc">Tidak perlu lagi menebak kualitas. AI kami memindai dan memberikan skor objektivitas kualitas hasil panen secara otomatis.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">⛓️</div>
					<h3 class="feature-title">Jejak Blockchain</h3>
					<p class="feature-desc">Setiap panen dicatat dalam blockchain. UMKM dapat memindai QR code untuk memverifikasi orisinalitas langsung dari kebun.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🤝</div>
					<h3 class="feature-title">Reputasi Terpercaya</h3>
					<p class="feature-desc">Bangun rekam jejak yang solid. Petani berkualitas akan selalu direkomendasikan kepada UMKM yang mencari bahan baku terbaik.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="how-it-works">
		<div class="section-container">
			<div class="section-header">
				<h2 class="section-title">Cara Kerja Ekosistem</h2>
			</div>
			
			<div class="steps-container">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h4>Petani Unggah Foto Panen</h4>
						<p>AI Taniva langsung memproses foto untuk menghasilkan skor kualitas.</p>
					</div>
				</div>
				<div class="step-connector"></div>
				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h4>Sertifikat Blockchain Dibuat</h4>
						<p>Sistem merilis QR Code sebagai bukti otentik tanpa bisa dipalsukan.</p>
					</div>
				</div>
				<div class="step-connector"></div>
				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h4>UMKM Terima & Verifikasi</h4>
						<p>Pindai QR Code untuk cek kualitas, lalu berikan rating pada Petani.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section">
		<div class="cta-box">
			<h2>Tingkatkan Standar Bisnis Anda Hari Ini</h2>
			<p>Bergabunglah dengan ribuan Petani dan UMKM di Solo Raya yang telah menggunakan Taniva.</p>
			<button class="btn-primary btn-large" onclick={() => goto('/login')}>Daftar Gratis Sekarang</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-content">
			<div class="footer-brand">🌿 Taniva</div>
			<div class="footer-copy">© 2026 Taniva Agri-Tech. Hak cipta dilindungi.</div>
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

	/* Navbar */
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		padding: 1rem 0;
		z-index: 100;
		background: rgba(250, 249, 245, 0.85);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(27, 94, 32, 0.05);
		transition: all 0.3s ease;
	}

	.nav-content {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		color: #1b5e20;
		letter-spacing: -0.02em;
	}

	.btn-login {
		background: #ffffff;
		border: 2px solid #1b5e20;
		color: #1b5e20;
		padding: 0.5rem 1.5rem;
		border-radius: 100px;
		font-weight: 700;
		font-size: 0.9375rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.btn-login:hover {
		background: #1b5e20;
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(27, 94, 32, 0.2);
		transform: translateY(-2px);
	}

	/* Hero Section */
	.hero-section {
		position: relative;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding: 6rem 2rem 2rem;
		overflow: hidden;
	}

	.hero-container {
		position: relative;
		z-index: 10;
		max-width: 76rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr;
		gap: 4rem;
		align-items: center;
	}

	@media (min-width: 1024px) {
		.hero-container {
			grid-template-columns: 1.1fr 0.9fr;
			padding-top: 2rem;
		}
	}

	.mesh-bg {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: 
			radial-gradient(circle at 60% 40%, rgba(165, 214, 167, 0.4) 0%, transparent 40%),
			radial-gradient(circle at 40% 60%, rgba(27, 94, 32, 0.08) 0%, transparent 40%),
			radial-gradient(circle at 80% 20%, rgba(255, 236, 179, 0.3) 0%, transparent 40%);
		filter: blur(80px);
		z-index: 0;
		animation: rotateMesh 40s linear infinite;
	}

	@keyframes rotateMesh {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	@media (max-width: 1023px) {
		.hero-content {
			align-items: center;
			text-align: center;
		}
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #e8f5e9;
		color: #1b5e20;
		padding: 0.5rem 1rem;
		border-radius: 100px;
		font-weight: 700;
		font-size: 0.875rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(27, 94, 32, 0.1);
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		background: #27c93f;
		border-radius: 50%;
		box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.7);
		animation: pulseDot 2s infinite;
	}

	@keyframes pulseDot {
		0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 201, 63, 0.7); }
		70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(39, 201, 63, 0); }
		100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(39, 201, 63, 0); }
	}

	.hero-title {
		font-size: clamp(3rem, 7vw, 5rem);
		font-weight: 800;
		color: #111827;
		line-height: 1.05;
		letter-spacing: -0.03em;
		margin: 0 0 1.5rem;
	}

	.text-gradient {
		background: linear-gradient(135deg, #1b5e20 0%, #4caf50 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-desc {
		font-size: clamp(1.125rem, 2vw, 1.25rem);
		color: #4b5563;
		line-height: 1.6;
		margin: 0 0 3rem;
		max-width: 40rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	@media (max-width: 1023px) {
		.hero-actions {
			justify-content: center;
		}
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
		color: white;
		border: none;
		padding: 1.125rem 2.5rem;
		border-radius: 100px;
		font-size: 1.125rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.25);
		text-decoration: none;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.35);
	}

	.btn-primary .arrow {
		transition: transform 0.3s;
	}

	.btn-primary:hover .arrow {
		transform: translateX(4px);
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: #111827;
		border: 2px solid #e5e7eb;
		padding: 1.125rem 2.5rem;
		border-radius: 100px;
		font-size: 1.125rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		text-decoration: none;
	}

	.btn-secondary:hover {
		border-color: #1b5e20;
		color: #1b5e20;
		background: rgba(27, 94, 32, 0.05);
	}

	/* Mockup Window on Right Side */
	.hero-visual {
		width: 100%;
		display: flex;
		justify-content: center;
		position: relative;
	}

	.mockup-window {
		width: 100%;
		max-width: 24rem;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.8);
		box-shadow: 
			0 24px 48px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 1);
		position: relative;
		overflow: hidden;
		transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
		transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
	}
	
	.mockup-window:hover {
		transform: perspective(1000px) rotateY(0) rotateX(0) scale(1.02);
	}

	.glow-effect {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle at 50% 50%, rgba(27, 94, 32, 0.05) 0%, transparent 60%);
		pointer-events: none;
		z-index: 0;
	}

	.mockup-header {
		display: flex;
		gap: 0.5rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 1;
	}

	.mockup-header .dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.mockup-body {
		padding: 1.5rem;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.m-title {
		font-weight: 800;
		color: #111827;
		font-size: 1.125rem;
		margin-bottom: 0.5rem;
	}

	.mockup-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: white;
		padding: 1rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.02);
	}

	.mc-icon {
		font-size: 1.5rem;
		width: 3rem;
		height: 3rem;
		background: #f4f4f0;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mc-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mc-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.mc-val {
		font-size: 0.9375rem;
		font-weight: 700;
		color: #111827;
	}

	.text-green { color: #1b5e20; }
	.font-mono { font-family: monospace; letter-spacing: 0; color: #4b5563; }

	/* Sections Common */
	.section-container {
		max-width: 72rem;
		margin: 0 auto;
		padding: 6rem 2rem;
	}

	.section-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.section-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: #111827;
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
	}

	.section-subtitle {
		font-size: 1.125rem;
		color: #6b7280;
		max-width: 36rem;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Features Grid */
	.features-section {
		background: white;
		position: relative;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: #faf9f5;
		padding: 3rem 2rem;
		border-radius: 24px;
		transition: all 0.3s ease;
		border: 1px solid transparent;
	}

	.feature-card:hover {
		background: white;
		border-color: rgba(27, 94, 32, 0.1);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
		transform: translateY(-4px);
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1.5rem;
		background: #e8f5e9;
		width: 5rem;
		height: 5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20px;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 1rem;
	}

	.feature-desc {
		color: #4b5563;
		line-height: 1.6;
		margin: 0;
	}

	/* How It Works */
	.how-it-works {
		background: #faf9f5;
	}

	.steps-container {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.steps-container {
			flex-direction: column;
			gap: 3rem;
		}
		.step-connector { display: none; }
	}

	.step {
		flex: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.step-number {
		width: 4rem;
		height: 4rem;
		background: #1b5e20;
		color: white;
		font-size: 1.5rem;
		font-weight: 800;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.2);
	}

	.step-content h4 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		margin: 0 0 0.5rem;
	}

	.step-content p {
		color: #6b7280;
		line-height: 1.6;
		margin: 0;
	}

	.step-connector {
		flex: 0.5;
		height: 2px;
		background: repeating-linear-gradient(90deg, #d1d5db 0, #d1d5db 4px, transparent 4px, transparent 8px);
		margin-top: 2rem;
	}

	/* CTA Section */
	.cta-section {
		padding: 4rem 2rem 8rem;
		background: white;
	}

	.cta-box {
		max-width: 64rem;
		margin: 0 auto;
		background: linear-gradient(135deg, #1b5e20 0%, #144d18 100%);
		border-radius: 32px;
		padding: 4rem 2rem;
		text-align: center;
		color: white;
		box-shadow: 0 24px 48px rgba(27, 94, 32, 0.2);
	}

	.cta-box h2 {
		font-size: 2.5rem;
		font-weight: 800;
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
	}

	.cta-box p {
		font-size: 1.125rem;
		opacity: 0.9;
		max-width: 36rem;
		margin: 0 auto 2.5rem;
		line-height: 1.6;
	}

	.btn-large {
		padding: 1.25rem 3rem;
		font-size: 1.25rem;
		background: white;
		color: #1b5e20;
	}

	.btn-large:hover {
		background: #f4f4f0;
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
	}

	/* Footer */
	.footer {
		background: #f4f4f0;
		padding: 2rem 0;
		text-align: center;
	}

	.footer-content {
		max-width: 72rem;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.footer-brand {
		font-size: 1.25rem;
		font-weight: 800;
		color: #1b5e20;
	}

	.footer-copy {
		color: #6b7280;
		font-size: 0.875rem;
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
