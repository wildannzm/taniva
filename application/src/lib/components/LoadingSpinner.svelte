<script>
	let { label = "Memuat..." } = $props();
</script>

<div class="loading-container animate-fade-in">
	<div class="loading-spinner"></div>
	<p class="loading-label">{label}</p>
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
	}

	.loading-spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid var(--color-surface-container-high);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 1rem;
	}

	.loading-label {
		font-size: 0.9375rem;
		color: var(--color-on-surface-variant);
		font-weight: 500;
		margin: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
