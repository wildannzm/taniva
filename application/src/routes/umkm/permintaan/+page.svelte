<script>
	import { goto } from '$app/navigation';
	import { userRole, transactionState } from '$lib/stores/app.js';
	import { extractIntent } from '$lib/api/client.js';
	
	import NaturalLanguageInput from '$lib/components/NaturalLanguageInput.svelte';
	import ExtractedIntentConfirm from '$lib/components/ExtractedIntentConfirm.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';

	userRole.set('umkm');
	
	let currentStep = $state('input'); // 'input' | 'loading' | 'confirm'
	let error = $state(null);
	let intentData = $state(null);
	
	/** @param {string} text */
	async function handleSubmit(text) {
		currentStep = 'loading';
		error = null;
		
		try {
			const res = await extractIntent(text);
			intentData = res;
			currentStep = 'confirm';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'input';
		}
	}
	
	function handleConfirm() {
		transactionState.update(s => ({ ...s, nlpIntent: intentData }));
		goto('/umkm/matching');
	}
	
	function handleCancel() {
		currentStep = 'input';
		intentData = null;
	}
</script>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">Cari Petani</h1>
		<p class="page-subtitle">Sistem pintar kami akan mencocokkan kebutuhan Anda dengan stok petani terdekat.</p>
	</header>
	
	{#if error}
		<ErrorBanner message={error} onDismiss={() => error = null} />
	{/if}
	
	<div class="content-area">
		{#if currentStep === 'input'}
			<div class="animate-fade-in">
				<NaturalLanguageInput onSubmit={handleSubmit} />
			</div>
			
		{:else if currentStep === 'loading'}
			<div class="card">
				<LoadingSpinner label="AI sedang memproses permintaan Anda..." />
			</div>
			
		{:else if currentStep === 'confirm' && intentData}
			<ExtractedIntentConfirm 
				intent={intentData} 
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		{/if}
	</div>
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 40rem;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-title {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.page-subtitle {
		margin: 0;
		color: var(--color-on-surface-variant);
	}
</style>
