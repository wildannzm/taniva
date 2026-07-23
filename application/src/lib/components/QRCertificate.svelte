<script>
	let { batchId, hash, timestamp, score, verifyUrl = '' } = $props();
</script>

<div class="cert-card card animate-scale-in">
	<div class="cert-header">
		<span class="cert-icon">🛡️</span>
		<h3 class="cert-title">Sertifikat Digital Taniva</h3>
		<span class="badge-verified">✅ Terverifikasi</span>
	</div>
	
	<div class="qr-placeholder">
		{#if verifyUrl}
			<div class="qr-code-wrapper">
				<img 
					src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`} 
					alt="QR Code" 
					width="120" 
					height="120" 
					class="qr-image"
				/>
			</div>
		{:else}
			<div class="qr-mock">
				<svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="7" height="7" rx="1"/>
					<rect x="14" y="3" width="7" height="7" rx="1"/>
					<rect x="14" y="14" width="7" height="7" rx="1"/>
					<rect x="3" y="14" width="7" height="7" rx="1"/>
					<path d="M7 7h.01M18 7h.01M18 18h.01M7 18h.01M11 10h2M10 14h4"/>
				</svg>
			</div>
		{/if}
		<p class="qr-hint">Scan untuk validasi</p>
	</div>

	<div class="cert-details">
		<div class="detail-row">
			<span class="detail-label">Batch ID</span>
			<span class="detail-value mono">{batchId.split('-')[0]}...</span>
		</div>
		<div class="detail-row">
			<span class="detail-label">Tanggal</span>
			<span class="detail-value">{new Date(timestamp).toLocaleDateString('id-ID')}</span>
		</div>
		<div class="detail-row">
			<span class="detail-label">Skor</span>
			<span class="detail-value font-semibold text-primary">{score}/100</span>
		</div>
		<div class="detail-row hash-row">
			<span class="detail-label">SHA-256</span>
			<span class="detail-value mono hash-text" title={hash}>{hash}</span>
		</div>
	</div>
</div>

<style>
	.cert-card {
		max-width: 22rem;
		margin: 0 auto;
		background: linear-gradient(to bottom, var(--color-surface-container-lowest), var(--color-surface));
		border: 1.5px solid var(--color-primary-container);
	}

	.cert-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px dashed var(--color-outline-variant);
	}

	.cert-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.cert-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-on-surface);
	}

	.qr-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.qr-mock, .qr-code-wrapper {
		background: white;
		padding: 0.5rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-outline-variant);
		color: var(--color-on-surface);
		margin-bottom: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.qr-image {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.qr-hint {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
		margin: 0;
	}

	.cert-details {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		background: var(--color-surface-container-low);
		padding: 1rem;
		border-radius: var(--radius-card);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8125rem;
	}

	.hash-row {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		margin-top: 0.25rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-outline-variant);
	}

	.detail-label {
		color: var(--color-on-surface-variant);
	}

	.detail-value {
		color: var(--color-on-surface);
		font-weight: 500;
	}

	.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.hash-text {
		font-size: 0.6875rem;
		word-break: break-all;
		color: var(--color-on-surface-variant);
		line-height: 1.3;
	}
	
	.text-primary {
		color: var(--color-primary);
	}
	
	.font-semibold {
		font-weight: 600;
	}
</style>
