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

	const FARMER_ID = 'f1-uuid';
	
	let currentStep = $state('upload');
	let error = $state(null);
	/** @type {any} */
	let uploadResult = $state(null);
	
	/** @param {File | null} file */
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

<div class="page-layout">
	<div class="mesh-bg"></div>
	
	<div class="container animate-fade-in-up">
		<a href="/petani" class="back-link">← Kembali ke Dashboard</a>
		
		<header class="page-header">
			<h1 class="page-title">Grading Kualitas</h1>
			<p class="page-subtitle">Upload foto tomat segar Anda untuk verifikasi AI (Computer Vision).</p>
		</header>
		
		{#if error}
			<ErrorBanner message={error} onDismiss={() => error = null} />
		{/if}
		
		<div class="content-area">
			{#if currentStep === 'upload'}
				<div class="card glass-card">
					<PhotoUploader onFileSelect={handlePhotoSelect} />
				</div>
				
			{:else if currentStep === 'loading'}
				<div class="card glass-card">
					<LoadingSpinner label="Menganalisis Kualitas dengan AI (Computer Vision)..." />
				</div>
				
			{:else if currentStep === 'result' && uploadResult}
				<div class="result-grid animate-fade-in">
					<div class="result-column">
						<QualityScoreCard score={uploadResult.skor_kualitas} />
						<button class="btn-primary-outline mt-4" onclick={reset}>Upload Foto Lain</button>
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
		max-width: 56rem;
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
	
	.btn-primary-outline {
		width: 100%;
		padding: 1rem;
		background: transparent;
		border: 2px solid #1b5e20;
		color: #1b5e20;
		border-radius: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-primary-outline:hover {
		background: #1b5e20;
		color: white;
		box-shadow: 0 4px 12px rgba(27, 94, 32, 0.15);
	}

	.mt-4 { margin-top: 1rem; }

	.animate-fade-in-up {
		animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
