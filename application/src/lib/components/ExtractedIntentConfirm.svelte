<script>
	let { intent, onConfirm, onCancel } = $props();
</script>

<div class="confirm-card card animate-scale-in">
	<div class="confirm-header">
		<h3 class="confirm-title">Konfirmasi Pencarian</h3>
		<p class="confirm-desc">Sistem menangkap detail berikut dari permintaan Anda:</p>
	</div>
	
	<div class="params-grid">
		<div class="param-item">
			<span class="param-label">Komoditas</span>
			<span class="param-value capitalize">{intent.komoditas || '-'}</span>
		</div>
		<div class="param-item">
			<span class="param-label">Kuantitas</span>
			<span class="param-value">{intent.kuantitas || 0} {intent.satuan || ''}</span>
		</div>
		<div class="param-item">
			<span class="param-label">Kualitas Min.</span>
			<div style="display: flex; gap: 0.25rem; align-items: center;">
				<span class="param-value">{intent.kualitas_minimum || 0}/100</span>
				{#if intent.kualitas_minimum >= 80}
					<span class="grade grade-a" style="font-size: 0.625rem; padding: 0.125rem 0.375rem;">A</span>
				{:else if intent.kualitas_minimum >= 60}
					<span class="grade grade-b" style="font-size: 0.625rem; padding: 0.125rem 0.375rem;">B</span>
				{/if}
			</div>
		</div>
		<div class="param-item">
			<span class="param-label">Tenggat Waktu</span>
			<span class="param-value">{new Date(intent.tenggat).toLocaleDateString('id-ID')}</span>
		</div>
	</div>
	
	<div class="confirm-actions">
		<button class="btn btn-ghost" onclick={onCancel}>Ubah Pesan</button>
		<button class="btn btn-primary" onclick={onConfirm}>Cari Petani</button>
	</div>
</div>

<style>
	.confirm-card {
		border-color: var(--color-primary);
		background: var(--color-primary-container);
	}

	.confirm-header {
		margin-bottom: 1rem;
	}

	.confirm-title {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.confirm-desc {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-on-primary-container);
		opacity: 0.9;
	}

	.params-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		background: rgba(255, 255, 255, 0.6);
		padding: 1rem;
		border-radius: var(--radius-sm);
		margin-bottom: 1.25rem;
	}

	.param-item {
		display: flex;
		flex-direction: column;
	}

	.param-label {
		font-size: 0.6875rem;
		color: var(--color-on-surface-variant);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		margin-bottom: 0.125rem;
	}

	.param-value {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-on-surface);
	}

	.capitalize {
		text-transform: capitalize;
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	
	.confirm-actions .btn {
		min-height: 2.25rem;
		padding: 0.375rem 1rem;
		font-size: 0.875rem;
	}
</style>
