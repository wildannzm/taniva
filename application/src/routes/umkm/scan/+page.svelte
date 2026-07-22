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

<div class="page-layout">
	<div class="mesh-bg"></div>
	
	<div class="container animate-fade-in-up">
		<a href="/umkm" class="back-link">← Kembali ke Dashboard</a>
		
		{#if currentStep === 'scan' || currentStep === 'loading'}
			<header class="page-header">
				<h1 class="page-title">Terima Barang</h1>
				<p class="page-subtitle">Scan QR Code panen petani untuk verifikasi orisinalitas.</p>
			</header>
		{/if}
		
		{#if error}
			<ErrorBanner message={error} onDismiss={() => error = null} />
		{/if}
		
		<div class="content-area">
			{#if currentStep === 'scan'}
				<div class="card glass-card animate-fade-in">
					<QRScanner onScan={handleScan} />
				</div>
				
			{:else if currentStep === 'loading'}
				<div class="card glass-card">
					<LoadingSpinner label="Memverifikasi jejak rekam Blockchain..." />
				</div>
				
			{:else if currentStep === 'valid' && verifyResult}
				<div class="result-card valid-card animate-scale-in">
					<div class="result-icon pulse">✅</div>
					<h2 class="result-title">Sertifikat Panen Valid!</h2>
					<p class="result-desc">Panen ini terverifikasi 100% orisinal melalui blockchain Taniva.</p>
					
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
							<span class="d-label">Skor Kualitas (AI)</span>
							<span class="d-val font-bold text-primary">{verifyResult.skor_kualitas}/100</span>
						</div>
					</div>
					
					<button class="btn-primary mt-4" onclick={() => goto('/umkm/rating')}>
						Terima Barang & Beri Rating Petani
					</button>
				</div>
				
			{:else if currentStep === 'invalid'}
				<div class="result-card invalid-card animate-scale-in">
					<div class="result-icon shake">❌</div>
					<h2 class="result-title text-error">Sertifikat Tidak Valid</h2>
					<p class="result-desc">QR Code tidak terdaftar. Hati-hati, panen ini mungkin tidak melewati standar QC Taniva.</p>
					
					<button class="btn-primary-outline mt-4" onclick={() => currentStep = 'scan'}>
						Coba Scan Ulang
					</button>
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
		max-width: 40rem;
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

	.result-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(16px);
		border-radius: 20px;
		padding: 3rem 2rem;
		text-align: center;
		border: 2px solid transparent;
		box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
	}
	
	.valid-card {
		border-color: #1b5e20;
	}
	
	.invalid-card {
		border-color: #d32f2f;
	}

	.result-icon {
		font-size: 5rem;
		margin-bottom: 1rem;
		filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
	}
	
	.result-icon.pulse {
		animation: pulseIcon 2s infinite alternate;
	}

	.result-icon.shake {
		animation: shakeIcon 0.5s ease-in-out;
	}

	.result-title {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		font-weight: 800;
		color: #111827;
	}

	.result-desc {
		margin: 0 0 2rem;
		color: #6b7280;
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.verify-details {
		background: #f8fcf8;
		border: 1px solid #e8f5e9;
		border-radius: 12px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: left;
		margin-bottom: 2rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.75rem;
		border-bottom: 1px dashed #e5e7eb;
	}
	
	.detail-row:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}

	.d-label {
		font-size: 0.8125rem;
		color: #6b7280;
		font-weight: 500;
	}

	.d-val {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #111827;
	}
	
	.btn-primary {
		width: 100%;
		padding: 1rem;
		background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 8px 24px rgba(27, 94, 32, 0.2);
	}
	
	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 32px rgba(27, 94, 32, 0.3);
	}
	
	.btn-primary-outline {
		width: 100%;
		padding: 1rem;
		background: transparent;
		border: 2px solid #d32f2f;
		color: #d32f2f;
		border-radius: 12px;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.btn-primary-outline:hover {
		background: #ffebee;
	}
	
	.capitalize { text-transform: capitalize; }
	.font-bold { font-weight: 800; }
	.text-primary { color: #1b5e20; }
	.text-error { color: #d32f2f; }
	.mt-4 { margin-top: 1rem; }

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
	
	@keyframes pulseIcon {
		from { transform: scale(0.95); }
		to { transform: scale(1.05); }
	}
	
	@keyframes shakeIcon {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-10px); }
		40%, 80% { transform: translateX(10px); }
	}
</style>
