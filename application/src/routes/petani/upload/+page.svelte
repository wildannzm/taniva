<script>
	import { onMount } from 'svelte';
	import { userRole, transactionState } from '$lib/stores/app.js';
	import { uploadHarvest } from '$lib/api/harvest.api.js';
	import { errorMessageMapping, formatRupiah, formatKg, formatTanggal, formatScore } from '$lib/utils/formatters.js';
	
	import PhotoUploader from '$lib/components/PhotoUploader.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import FallbackNotice from '$lib/components/FallbackNotice.svelte';
	import FieldError from '$lib/components/FieldError.svelte';
	import QualityScoreCard from '$lib/components/QualityScoreCard.svelte';
	import QRCertificate from '$lib/components/QRCertificate.svelte';
	
	onMount(() => { userRole.set('petani'); });

	let { data } = $props();

	// State machine: idle -> validating -> uploading -> analyzing -> success | error
	let currentStep = $state('idle');
	
	/** @type {File|null} */
	let selectedFile = $state(null);
	
	// Form fields
	let quantityKg = $state('');
	let pricePerKg = $state('');
	let availableDate = $state(new Date().toISOString().split('T')[0]);
	
	// Form Errors
	/** @type {Record<string, string|null>} */
	let validationErrors = $state({});
	
	// Global Error for API
	/** @type {any} */
	let globalError = $state(null);
	
	// Result Data
	/** @type {any} */
	let uploadResult = $state(null);
	/** @type {any} */
	let metaResult = $state(null);

	function validateForm() {
		/** @type {Record<string, string>} */
		const errors = {};
		if (!selectedFile) errors.image = "Foto wajib diunggah.";
		if (!quantityKg || Number(quantityKg) <= 0) errors.quantityKg = "Kuantitas tidak valid.";
		if (!pricePerKg || Number(pricePerKg) < 0) errors.pricePerKg = "Harga tidak valid.";
		if (!availableDate) errors.availableDate = "Tanggal wajib diisi.";
		validationErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function getLocation() {
		return new Promise((resolve) => {
			if (!navigator.geolocation) return resolve({ lat: undefined, lng: undefined });
			navigator.geolocation.getCurrentPosition(
				(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
				() => resolve({ lat: undefined, lng: undefined }), // Fallback gracefully if denied
				{ timeout: 3000 }
			);
		});
	}

	async function handleSubmit() {
		currentStep = 'validating';
		globalError = null;
		
		if (!validateForm()) {
			currentStep = 'idle';
			return;
		}

		currentStep = 'uploading';
		try {
			const loc = await getLocation();
			currentStep = 'analyzing';
			
			const payload = {
				image: /** @type {File} */ (selectedFile),
				commodity: 'tomato',
				quantityKg: Number(quantityKg),
				pricePerKg: Number(pricePerKg),
				availableDate,
				farmerId: data.farmerId || '00000000-0000-0000-0000-000000000000',
				latitude: loc.lat,
				longitude: loc.lng
			};

			const { data: responseData, meta } = await uploadHarvest(payload);
			uploadResult = responseData;
			metaResult = meta;
			
			transactionState.update(s => ({ 
				...s, 
				lastUploadBatchId: responseData.batchId, 
				lastUploadResult: responseData 
			}));
			
			currentStep = 'success';
		} catch (e) {
			const err = /** @type {any} */ (e);
			globalError = err;
			
			// Map specific error codes from backend
			if (err.code === 'FILE_TOO_LARGE') {
				globalError.message = 'Ukuran foto terlalu besar. Maksimal 5MB.';
			} else if (err.code === 'UNSUPPORTED_FILE_TYPE') {
				globalError.message = 'Format file tidak didukung. Gunakan JPG/PNG.';
			} else if (err.code === 'EXTERNAL_TIMEOUT') {
				globalError.message = 'Server AI sedang sibuk. Silakan coba lagi.';
			} else if (err.code === 'NO_TOMATO_DETECTED') {
				globalError.message = 'Tomat tidak terdeteksi pada gambar. Pastikan foto jelas.';
			} else if (err.code === 'VALIDATION_ERROR') {
				globalError.message = 'Data form tidak valid.';
			}
			
			currentStep = 'error';
		}
	}
	
	function resetForm() {
		currentStep = 'idle';
		selectedFile = null;
		quantityKg = '';
		pricePerKg = '';
		availableDate = new Date().toISOString().split('T')[0];
		validationErrors = {};
		globalError = null;
		uploadResult = null;
		metaResult = null;
	}
</script>

<div class="page-layout">
	
	<div class="container animate-fade-in-up">
		<a href="/petani" class="back-link">← Kembali ke Dashboard</a>
		
		<header class="page-header">
			<h1 class="page-title">Registrasi Batch & Grading</h1>
			<p class="page-subtitle">Upload foto tomat Anda untuk dianalisis oleh AI (Computer Vision) dan buat batch baru.</p>
		</header>
		
		<div class="content-area">
			{#if currentStep === 'idle' || currentStep === 'validating' || currentStep === 'error'}
				<div class="card form-container">
					{#if currentStep === 'error'}
						<ErrorBanner 
							message={typeof globalError?.message === 'string' ? globalError.message : 'Terjadi kesalahan sistem'} 
							onDismiss={() => currentStep = 'idle'}
						/>
					{/if}
					<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
						<div class="form-group full-width">
							<label class="form-label" for="photo">Foto Hasil Panen</label>
							<PhotoUploader onFileSelect={(/** @type {File|null} */ f) => { selectedFile = f; validationErrors.image = null; }} />
							<FieldError error={validationErrors.image} />
						</div>

						<div class="form-row">
							<div class="form-group">
								<label class="form-label" for="quantityKg">Total Kuantitas (Kg)</label>
								<input type="number" id="quantityKg" class="form-input" min="1" step="0.1" bind:value={quantityKg} placeholder="Mis: 100" />
								<FieldError error={validationErrors.quantityKg} />
							</div>
							
							<div class="form-group">
								<label class="form-label" for="pricePerKg">Harga per Kg (Rp)</label>
								<input type="number" id="pricePerKg" class="form-input" min="0" step="1000" bind:value={pricePerKg} placeholder="Mis: 12000" />
								<FieldError error={validationErrors.pricePerKg} />
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label class="form-label" for="commodity">Komoditas</label>
								<input type="text" id="commodity" class="form-input" value="Tomat" readonly disabled />
							</div>
							
							<div class="form-group">
								<label class="form-label" for="availableDate">Tanggal Tersedia</label>
								<input type="date" id="availableDate" class="form-input" bind:value={availableDate} />
								<FieldError error={validationErrors.availableDate} />
							</div>
						</div>
						
						<button 
							type="submit" 
							class="btn-primary mt-6" 
							disabled={currentStep === 'validating'}
						>
							{currentStep === 'validating' ? 'Memvalidasi...' : 'Analisis & Simpan Batch'}
						</button>
					</form>
				</div>
				
			{:else if currentStep === 'uploading' || currentStep === 'analyzing'}
				<div class="card">
					<LoadingSpinner label={currentStep === 'uploading' ? "Mengunggah data..." : "AI sedang menganalisis kualitas tomat..."} />
				</div>
				
			{:else if currentStep === 'success' && uploadResult}
				<div class="result-container animate-fade-in">
					{#if metaResult?.fallbackUsed}
						<FallbackNotice message="Sistem menggunakan AI cadangan karena server utama sibuk. Hasil mungkin sedikit berbeda." />
					{/if}
					
					<div class="result-grid">
						<div class="result-column">
							<QualityScoreCard score={uploadResult.quality.score} />
							
							<div class="stats-card">
								<h4>Detail Kualitas (AI: {metaResult?.source})</h4>
								<div class="stat-row">
									<span>Total Tomat Terdeteksi</span>
									<strong>{uploadResult.quality.totalDetected} buah</strong>
								</div>
								<div class="stat-row text-success">
									<span>Segar</span>
									<strong>{uploadResult.quality.freshCount} buah</strong>
								</div>
								<div class="stat-row text-error">
									<span>Busuk/Cacat</span>
									<strong>{uploadResult.quality.rottenCount} buah</strong>
								</div>
								<div class="stat-row text-muted">
									<span>Waktu Inferensi</span>
									<strong>{metaResult?.inferenceTimeMs} ms</strong>
								</div>
							</div>
							
							<div class="stats-card mt-4">
								<h4>Informasi Batch</h4>
								<div class="stat-row">
									<span>ID Batch</span>
									<strong class="text-mono">{uploadResult.batchId}</strong>
								</div>
								<div class="stat-row">
									<span>Status</span>
									<strong class="badge-status">{uploadResult.status}</strong>
								</div>
								<div class="stat-row">
									<span>Kuantitas</span>
									<strong>{formatKg(uploadResult.quantityKg)}</strong>
								</div>
								<div class="stat-row">
									<span>Harga per Kg</span>
									<strong>{formatRupiah(uploadResult.pricePerKg)}</strong>
								</div>
								<div class="stat-row">
									<span>Tanggal Tersedia</span>
									<strong>{formatTanggal(uploadResult.availableDate)}</strong>
								</div>
							</div>
							
							<button class="btn-primary-outline mt-6" onclick={resetForm}>Buat Batch Baru</button>
						</div>
						
						<div class="result-column">
							<div class="annotated-image-wrapper">
								<img src={uploadResult.quality.annotatedImageUrl || '/placeholder.jpg'} alt="Hasil Analisis AI" class="annotated-img" />
								<div class="img-label">Pemindaian Visual AI</div>
							</div>
							
							<div class="mt-4">
								<QRCertificate 
									batchId={uploadResult.batchId}
									hash={uploadResult.certificate.hash}
									score={uploadResult.quality.score}
									timestamp={new Date().toISOString()}
									verifyUrl={uploadResult.certificate.verifyUrl}
								/>
							</div>
						</div>
					</div>
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
		color: #0f172a;
	}

	.container {
		position: relative;
		z-index: 1;
		max-width: 60rem;
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
		padding: 2rem;
	}

	.form-container {
		max-width: 48rem;
		margin: 0 auto;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}

	@media (min-width: 640px) {
		.form-row {
			flex-direction: row;
		}
	}

	.form-group {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.full-width {
		width: 100%;
	}

	.form-label {
		font-weight: 700;
		font-size: 0.8125rem;
		margin-bottom: 0.5rem;
		color: #475569;
	}

	.form-input {
		padding: 0.75rem 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		background: #f8fafc;
		color: #0f172a;
		transition: border-color 0.2s;
	}
	
	.form-input:focus {
		outline: none;
		border-color: #1b5e20;
		background: #ffffff;
	}

	.form-input:disabled {
		background: #f1f5f9;
		color: #94a3b8;
		cursor: not-allowed;
	}

	.btn-primary {
		width: 100%;
		padding: 1rem;
		background: #1b5e20;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: #144d18;
	}

	.btn-primary:disabled {
		background: #94a3b8;
		cursor: not-allowed;
	}

	.btn-primary-outline {
		width: 100%;
		padding: 1rem;
		background: transparent;
		border: 1px solid #1b5e20;
		color: #1b5e20;
		border-radius: 8px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}
	
	.btn-primary-outline:hover {
		background: #f8fcf8;
	}

	.result-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
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

	.stats-card {
		background: #ffffff;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e2e8f0;
		margin-top: 1rem;
	}

	.stats-card h4 {
		margin: 0 0 1rem;
		font-size: 1rem;
		font-weight: 800;
		color: #0f172a;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		font-size: 0.875rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.stat-row:last-child {
		border-bottom: none;
	}

	.text-success strong { color: #166534; }
	.text-error strong { color: #b91c1c; }
	.text-muted strong { color: #64748b; }
	.text-mono { font-family: monospace; background: #f8fafc; padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid #e2e8f0; }

	.badge-status {
		background: #dcfce7;
		color: #166534;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		text-transform: uppercase;
		font-weight: 700;
	}

	.annotated-image-wrapper {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid #e2e8f0;
		background: #ffffff;
	}

	.annotated-img {
		width: 100%;
		height: auto;
		display: block;
	}

	.img-label {
		position: absolute;
		top: 1rem;
		left: 1rem;
		background: #ffffff;
		color: #0f172a;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		border: 1px solid #e2e8f0;
	}

	.mt-4 { margin-top: 1rem; }
	.mt-6 { margin-top: 1.5rem; }

	.animate-fade-in-up {
		animation: fadeInUp 0.4s ease-out forwards;
	}

	.animate-fade-in {
		animation: fadeIn 0.4s ease-out forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
