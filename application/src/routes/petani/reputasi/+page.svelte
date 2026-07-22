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

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">Reputasi Saya</h1>
	</header>
	
	{#if error}
		<ErrorBanner message={error} onDismiss={() => fetchReputation()} />
	{/if}
	
	{#if currentStep === 'loading'}
		<div class="card">
			<LoadingSpinner label="Mengambil data reputasi..." />
		</div>
	{:else if currentStep === 'done'}
		<div class="card text-center animate-fade-in">
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

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 32rem;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}
	
	.text-center { text-align: center; }

	.score-circle {
		width: 10rem;
		height: 10rem;
		border-radius: 50%;
		background: var(--color-primary-container);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
		border: 4px solid var(--color-primary);
	}

	.score-val {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1;
	}

	.score-max {
		font-size: 1rem;
		color: var(--color-on-primary-container);
	}

	.status-title {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.status-desc {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-on-surface-variant);
		line-height: 1.5;
	}
</style>
