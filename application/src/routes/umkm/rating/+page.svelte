<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userRole } from '$lib/stores/app.js';
	import { submitRating } from '$lib/api/client.js';
	
	import RatingForm from '$lib/components/RatingForm.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';

	onMount(() => { userRole.set('umkm'); });
	
	let currentStep = $state('rating'); // 'rating' | 'loading' | 'success'
	let error = $state(null);
	let newReputation = $state(0);
	
	// Mock order ID for demo
	const ORDER_ID = 'ord-550e8400';
	
	/** 
	 * @param {number} ratingVal 
	 * @param {string} reviewText 
	 */
	async function handleSubmit(ratingVal, reviewText) {
		currentStep = 'loading';
		error = null;
		
		try {
			const res = await submitRating(ORDER_ID, ratingVal, reviewText);
			newReputation = res.skor_reputasi_baru;
			currentStep = 'success';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'rating';
		}
	}
</script>

<div class="page-container">
	{#if error}
		<ErrorBanner message={error} onDismiss={() => error = null} />
	{/if}
	
	<div class="content-area">
		{#if currentStep === 'rating'}
			<div class="animate-fade-in">
				<RatingForm onSubmit={handleSubmit} />
			</div>
			
		{:else if currentStep === 'loading'}
			<div class="card">
				<LoadingSpinner label="Mengirim ulasan dan memperbarui reputasi petani..." />
			</div>
			
		{:else if currentStep === 'success'}
			<div class="success-card card animate-scale-in">
				<div class="success-icon">🌟</div>
				<h2 class="success-title">Terima Kasih!</h2>
				<p class="success-desc">Ulasan Anda telah dikirim dan sistem Self-Correcting Reputation telah memperbarui skor petani.</p>
				
				<div class="rep-update">
					<span class="rep-label">Skor Reputasi Petani Baru</span>
					<span class="rep-val">{newReputation.toFixed(1)}/100</span>
				</div>
				
				<button class="btn btn-primary mt-4" style="width: 100%;" onclick={() => goto('/umkm')}>Kembali ke Dashboard</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 32rem;
		margin: 0 auto;
		min-height: calc(100vh - 100px);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.success-card {
		text-align: center;
		padding: 2.5rem 1.5rem;
		border-color: var(--color-primary);
	}
	
	.success-icon {
		font-size: 3.5rem;
		margin-bottom: 1rem;
	}
	
	.success-title {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
	}
	
	.success-desc {
		margin: 0 0 1.5rem;
		color: var(--color-on-surface-variant);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.rep-update {
		background: #fff8e1;
		border: 1px dashed #ffb300;
		padding: 1rem;
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.rep-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #f57f17;
		text-transform: uppercase;
	}

	.rep-val {
		font-size: 2rem;
		font-weight: 800;
		color: #f57f17;
		line-height: 1;
	}
	
	.mt-4 { margin-top: 1.5rem; }
</style>
