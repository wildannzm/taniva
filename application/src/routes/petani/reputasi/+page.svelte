<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	import { getFarmerReputation } from '$lib/api/client.js';
	
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	
	onMount(() => { userRole.set('petani'); fetchReputation(); });

	const FARMER_ID = 'f1-uuid';
	
	let currentStep = $state('loading');
	let error = $state(null);
	let score = $state(0);
	
	async function fetchReputation() {
		try {
			const res = await getFarmerReputation(FARMER_ID);
			score = res.skor_reputasi;
			currentStep = 'done';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'error';
		}
	}
</script>

<div class="page-layout">
	<div class="mesh-bg"></div>
	
	<div class="container animate-fade-in-up">
		<a href="/petani" class="back-link">← Kembali ke Dashboard</a>
		
		<header class="page-header">
			<h1 class="page-title">Reputasi Saya</h1>
			<p class="page-subtitle">Pantau skor kepercayaan UMKM terhadap Anda.</p>
		</header>
		
		{#if error}
			<ErrorBanner message={error} onDismiss={() => fetchReputation()} />
		{/if}
		
		<div class="content-area">
			{#if currentStep === 'loading'}
				<div class="card glass-card">
					<LoadingSpinner label="Mengambil data reputasi..." />
				</div>
			{:else if currentStep === 'done'}
				<div class="card glass-card text-center animate-scale-in">
					<div class="score-circle">
						<span class="score-val">{score.toFixed(1)}</span>
						<span class="score-max">/100</span>
					</div>
					
					<h3 class="status-title">
						{#if score >= 90}Sangat Baik
						{:else if score >= 75}Baik
						{:else if score >= 60}Cukup
						{:else}Perlu Perbaikan{/if}
					</h3>
					
					<p class="status-desc">
						Skor ini diperbarui otomatis berdasarkan penilaian dari UMKM yang menerima pesanan Anda.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.page-layout {
		min-height: 100dvh;
		background: #faf9f5;
		position: relative;
		overflow: hidden;
		padding: 2rem 1.5rem 6rem;
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	.mesh-bg {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 100vh;
		background: 
			radial-gradient(circle at 50% 0%, rgba(165, 214, 167, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(27, 94, 32, 0.05) 0%, transparent 50%);
		z-index: 0;
		pointer-events: none;
	}

	.container {
		position: relative;
		z-index: 1;
		max-width: 32rem;
		margin: 0 auto;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: #1b5e20;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.875rem;
		transition: transform 0.2s;
	}
	
	.back-link:hover {
		transform: translateX(-4px);
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-title {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 800;
		color: #111827;
		letter-spacing: -0.02em;
	}
	
	.page-subtitle {
		margin: 0;
		font-size: 1rem;
		color: #6b7280;
	}

	.card.glass-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 20px;
		padding: 3rem 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
	}
	
	.text-center { text-align: center; }

	.score-circle {
		width: 12rem;
		height: 12rem;
		border-radius: 50%;
		background: #e8f5e9;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto 2rem;
		border: 6px solid #1b5e20;
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.15);
	}

	.score-val {
		font-size: 3.5rem;
		font-weight: 800;
		color: #1b5e20;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.score-max {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(27, 94, 32, 0.7);
		margin-top: 0.25rem;
	}

	.status-title {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
	}

	.status-desc {
		margin: 0;
		font-size: 0.9375rem;
		color: #6b7280;
		line-height: 1.6;
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	
	.animate-scale-in {
		animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
