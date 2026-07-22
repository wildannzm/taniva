<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userRole } from '$lib/stores/app.js';
	import { verifyHarvest } from '$lib/api/client.js';
	
	import QRScanner from '$lib/components/QRScanner.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';

	onMount(() => { userRole.set('umkm'); });
	
	let currentStep = $state('scan'); // 'scan' | 'loading' | 'valid' | 'invalid'
	let error = $state(null);
	/** @type {any} */
	let verifyResult = $state(null);
	
	/** @param {string} batchId */
	async function handleScan(batchId) {
		currentStep = 'loading';
		error = null;
		
		try {
			const res = await verifyHarvest(batchId);
			verifyResult = res;
			currentStep = res.valid ? 'valid' : 'invalid';
		} catch (/** @type {any} */ err) {
			error = err.message;
			currentStep = 'scan';
		}
	}
</script>

<div class="page-container">
	{#if currentStep === 'scan' || currentStep === 'loading'}
		<header class="page-header">
			<h1 class="page-title">Penerimaan Barang</h1>
		</header>
	{/if}
	
	{#if error}
		<ErrorBanner message={error} onDismiss={() => error = null} />
	{/if}
	
	<div class="content-area">
		{#if currentStep === 'scan'}
			<div class="animate-fade-in">
				<QRScanner onScan={handleScan} />
			</div>
			
		{:else if currentStep === 'loading'}
			<div class="card">
				<LoadingSpinner label="Memverifikasi QR Code di blockchain/database..." />
			</div>
			
		{:else if currentStep === 'valid' && verifyResult}
			<div class="result-card valid-card animate-scale-in">
				<div class="result-icon">✅</div>
				<h2 class="result-title">Sertifikat Valid!</h2>
				<p class="result-desc">Barang ini terverifikasi asli dari sistem Taniva.</p>
				
				<div class="verify-details">
					<div class="detail-row">
						<span class="d-label">Petani</span>
						<span class="d-val">{verifyResult.farmer_nama}</span>
					</div>
					<div class="detail-row">
						<span class="d-label">Komoditas</span>
						<span class="d-val capitalize">{verifyResult.komoditas}</span>
					</div>
					<div class="detail-row">
						<span class="d-label">Skor Kualitas (Grading Awal)</span>
						<span class="d-val font-bold text-primary">{verifyResult.skor_kualitas}/100</span>
					</div>
				</div>
				
				<button class="btn btn-primary mt-4" style="width: 100%;" onclick={() => goto('/umkm/rating')}>
					Terima & Beri Penilaian
				</button>
			</div>
			
		{:else if currentStep === 'invalid'}
			<div class="result-card invalid-card animate-scale-in">
				<div class="result-icon">❌</div>
				<h2 class="result-title text-error">Sertifikat Tidak Valid</h2>
				<p class="result-desc">QR Code tidak dikenali atau telah diubah. Mohon periksa kembali fisik barang dan laporkan ke admin jika mencurigakan.</p>
				
				<button class="btn btn-ghost mt-4" style="width: 100%;" onclick={() => currentStep = 'scan'}>Scan Ulang</button>
			</div>
		{/if}
	</div>
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

	.result-card {
		background: var(--color-surface-container-lowest);
		border-radius: var(--radius-card);
		padding: 2rem 1.5rem;
		text-align: center;
		border: 1px solid var(--color-outline-variant);
	}
	
	.valid-card {
		border-color: var(--color-primary);
		box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
	}
	
	.invalid-card {
		border-color: var(--color-error);
	}

	.result-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.result-title {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.result-desc {
		margin: 0 0 1.5rem;
		color: var(--color-on-surface-variant);
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.verify-details {
		background: var(--color-surface-container-low);
		border-radius: var(--radius-sm);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: left;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.d-label {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
	}

	.d-val {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-on-surface);
	}
	
	.capitalize { text-transform: capitalize; }
	.font-bold { font-weight: 700; }
	.text-primary { color: var(--color-primary); }
	.text-error { color: var(--color-error); }
	.mt-4 { margin-top: 1.5rem; }
</style>
