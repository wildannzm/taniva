<script>
	let { onScan } = $props();
	
	let manualBatchId = $state('');
	
	/** @param {Event} e */
	function handleManualSubmit(e) {
		e.preventDefault();
		if (manualBatchId.trim()) {
			onScan(manualBatchId.trim());
		}
	}
	
	function simulateScan() {
		// Mock scan success for hackathon demo
		onScan("550e8400-e29b-41d4-a716-446655440000");
	}
</script>

<div class="scanner-card card">
	<div class="scanner-header">
		<h3 class="scanner-title">Validasi Barang Tiba</h3>
		<p class="scanner-desc">Arahkan kamera ke QR Code pada kemasan tomat.</p>
	</div>
	
	<div class="camera-viewfinder" onclick={simulateScan} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && simulateScan()}>
		<!-- Mock camera view -->
		<div class="corner top-left"></div>
		<div class="corner top-right"></div>
		<div class="corner bottom-left"></div>
		<div class="corner bottom-right"></div>
		
		<div class="scan-line"></div>
		
		<p class="camera-hint">Ketuk untuk simulasi scan</p>
	</div>
	
	<div class="divider">
		<span>ATAU</span>
	</div>
	
	<form class="manual-input-form" onsubmit={handleManualSubmit}>
		<label for="batch_id" class="text-label-md" style="color: var(--color-on-surface-variant); display: block; margin-bottom: 0.5rem;">Input Batch ID Manual (Fallback)</label>
		<div style="display: flex; gap: 0.5rem;">
			<input 
				type="text" 
				id="batch_id"
				placeholder="Contoh: 550e8400-e29b..."
				class="input-field"
				bind:value={manualBatchId}
			/>
			<button type="submit" class="btn btn-primary" disabled={!manualBatchId}>Validasi</button>
		</div>
	</form>
</div>

<style>
	.scanner-card {
		max-width: 28rem;
		margin: 0 auto;
	}

	.scanner-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.scanner-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.scanner-desc {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-on-surface-variant);
	}

	.camera-viewfinder {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: #000;
		border-radius: var(--radius-card);
		overflow: hidden;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.corner {
		position: absolute;
		width: 2rem;
		height: 2rem;
		border-color: var(--color-primary);
		border-style: solid;
		border-width: 0;
	}

	.top-left { top: 1rem; left: 1rem; border-top-width: 3px; border-left-width: 3px; }
	.top-right { top: 1rem; right: 1rem; border-top-width: 3px; border-right-width: 3px; }
	.bottom-left { bottom: 1rem; left: 1rem; border-bottom-width: 3px; border-left-width: 3px; }
	.bottom-right { bottom: 1rem; right: 1rem; border-bottom-width: 3px; border-right-width: 3px; }

	.scan-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-primary);
		box-shadow: 0 0 8px var(--color-primary);
		animation: scan 2s linear infinite alternate;
	}

	.camera-hint {
		color: rgba(255,255,255,0.7);
		font-size: 0.875rem;
		z-index: 10;
	}

	@keyframes scan {
		0% { top: 10%; }
		100% { top: 90%; }
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
		color: var(--color-on-surface-variant);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-outline-variant);
	}

	.input-field {
		flex: 1;
		padding: 0.625rem 0.875rem;
		border: 1.5px solid var(--color-outline-variant);
		border-radius: var(--radius-card);
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		outline: none;
		transition: border-color var(--duration-fast) var(--ease-smooth);
	}

	.input-field:focus {
		border-color: var(--color-primary);
	}
</style>
