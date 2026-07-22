<script>
	import { onMount } from 'svelte';
	import { userRole, transactionState } from '$lib/stores/app.js';
	import { uploadHarvest } from '$lib/api/client.js';
	
	import PhotoUploader from '$lib/components/PhotoUploader.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import QualityScoreCard from '$lib/components/QualityScoreCard.svelte';
	import QRCertificate from '$lib/components/QRCertificate.svelte';
	
	onMount(() => { userRole.set('petani'); });

	// MOCK: In real app, get from auth session
	const FARMER_ID = 'f1-uuid';
	
	let currentStep = $state('upload'); // 'upload' | 'loading' | 'result'
	let error = $state(null);
	/** @type {any} */
	let uploadResult = $state(null);
	
	/**
	 * @param {File | null} file
	 */
	async function handlePhotoSelect(file) {
		if (!file) return;
		
		currentStep = 'loading';
		error = null;
		
		try {
			const res = await uploadHarvest(file, FARMER_ID);
			uploadResult = res;
			transactionState.update(s => ({ ...s, lastUploadBatchId: res.batch_id, lastUploadResult: res }));
			currentStep = 'result';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'upload';
		}
	}
	
	function reset() {
		currentStep = 'upload';
		error = null;
		uploadResult = null;
	}
</script>

<div class="page-container">
	<header class="page-header">
		<h1 class="page-title">Grading Kualitas</h1>
		<p class="page-subtitle">Upload foto tomat segar Anda untuk verifikasi AI (Computer Vision).</p>
	</header>
	
	{#if error}
		<ErrorBanner message={error} onDismiss={() => error = null} />
	{/if}
	
	<div class="content-area">
		{#if currentStep === 'upload'}
			<PhotoUploader onFileSelect={handlePhotoSelect} />
			
		{:else if currentStep === 'loading'}
			<div class="card">
				<LoadingSpinner label="Menganalisis Kualitas dengan AI (Computer Vision)..." />
			</div>
			
		{:else if currentStep === 'result' && uploadResult}
			<div class="result-grid animate-fade-in">
				<div class="result-column">
					<QualityScoreCard score={uploadResult.skor_kualitas} />
					<button class="btn btn-ghost mt-4" style="width: 100%;" onclick={reset}>Scan Ulang</button>
				</div>
				<div class="result-column">
					<QRCertificate 
						batchId={uploadResult.batch_id}
						hash={uploadResult.hash_sha256}
						score={uploadResult.skor_kualitas}
						timestamp={uploadResult.timestamp}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 56rem;
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

	.content-area {
		display: flex;
		justify-content: center;
	}

	.result-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.result-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.result-column {
		display: flex;
		flex-direction: column;
	}
	
	.mt-4 { margin-top: 1rem; }
</style>
