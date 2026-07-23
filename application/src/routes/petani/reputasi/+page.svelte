<script>
	import { onMount } from 'svelte';
	import { userRole } from '$lib/stores/app.js';
	import { getFarmerReputation } from '$lib/api/farmer.api.js';
	
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	
	onMount(() => { userRole.set('petani'); fetchReputation(); });

	const FARMER_ID = 'f1-uuid';
	
	let currentStep = $state('loading');
	let error = $state(null);
	let score = $state(0);
	
	async function fetchReputation() {
		try {
			const { data } = await getFarmerReputation(FARMER_ID);
			score = data.skor_reputasi;
			currentStep = 'done';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'error';
		}
	}
</script>

<div class="page-layout">
	
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
				<div class="card">
					<LoadingSpinner label="Mengambil data reputasi..." />
				</div>
			{:else if currentStep === 'done'}
				<div class="card text-center animate-scale-in">
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
		background: #f8fafc;
		position: relative;
		overflow: hidden;
		padding: 2rem 1.5rem 6rem;
		font-family: var(--font-sans, system-ui, sans-serif);
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
		font-weight: 700;
		font-size: 0.875rem;
	}
	
	.back-link:hover {
		text-decoration: underline;
	}

	.page-header {
		margin-bottom: 2.5rem;
		text-align: center;
	}

	.page-title {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.02em;
	}
	
	.page-subtitle {
		margin: 0;
		font-size: 1rem;
		color: #64748b;
	}

	.card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 3rem 2rem;
	}
	
	.text-center { text-align: center; }

	.score-circle {
		width: 12rem;
		height: 12rem;
		border-radius: 50%;
		background: #f8fcf8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto 2rem;
		border: 4px solid #1b5e20;
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
		font-weight: 700;
		color: rgba(27, 94, 32, 0.7);
		margin-top: 0.25rem;
	}

	.status-title {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 800;
		color: #0f172a;
	}

	.status-desc {
		margin: 0;
		font-size: 0.9375rem;
		color: #64748b;
		line-height: 1.6;
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.4s ease-out forwards;
	}
	
	.animate-scale-in {
		animation: scaleIn 0.4s ease-out forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
