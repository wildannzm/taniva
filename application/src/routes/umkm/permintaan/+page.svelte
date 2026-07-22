<script>
	import { goto } from '$app/navigation';
	import { userRole, transactionState } from '$lib/stores/app.js';
	import { extractIntent } from '$lib/api/client.js';
	
	import NaturalLanguageInput from '$lib/components/NaturalLanguageInput.svelte';
	import ExtractedIntentConfirm from '$lib/components/ExtractedIntentConfirm.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';

	userRole.set('umkm');
	
	let currentStep = $state('input');
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

<div class="page-layout">
	<div class="mesh-bg"></div>
	
	<div class="container animate-fade-in-up">
		<a href="/umkm" class="back-link">← Kembali ke Dashboard</a>
		
		<header class="page-header">
			<h1 class="page-title">Cari Petani (Pesan Pintar)</h1>
			<p class="page-subtitle">Sistem pintar AI kami akan memproses bahasa natural Anda untuk mencari petani terdekat.</p>
		</header>
		
		{#if error}
			<ErrorBanner message={error} onDismiss={() => error = null} />
		{/if}
		
		<div class="content-area">
			{#if currentStep === 'input'}
				<div class="card glass-card animate-fade-in">
					<NaturalLanguageInput onSubmit={handleSubmit} />
				</div>
				
			{:else if currentStep === 'loading'}
				<div class="card glass-card">
					<LoadingSpinner label="AI sedang mengekstrak niat (intent) Anda..." />
				</div>
				
			{:else if currentStep === 'confirm' && intentData}
				<div class="card glass-card animate-scale-in">
					<ExtractedIntentConfirm 
						intent={intentData} 
						onConfirm={handleConfirm}
						onCancel={handleCancel}
					/>
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
		max-width: 48rem;
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
		padding: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.animate-fade-in {
		animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	
	.animate-scale-in {
		animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
