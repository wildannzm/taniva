<script>
	let { message, onDismiss = null } = $props();
</script>

<div class="error-banner animate-fade-in">
	<span class="error-icon">⚠️</span>
	<div class="error-content">
		<p class="error-title">Terjadi Kesalahan</p>
		<p class="error-msg">{message}</p>
	</div>
	{#if onDismiss}
		<button class="error-close" onclick={onDismiss} aria-label="Tutup">×</button>
	{/if}
</div>

<style>
	.error-banner {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		background: #ffebee;
		border-left: 4px solid var(--color-error);
		border-radius: var(--radius-sm);
		color: #b71c1c;
		margin-bottom: 1rem;
	}

	.error-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	.error-content {
		flex: 1;
	}

	.error-title {
		margin: 0 0 0.125rem;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.error-msg {
		margin: 0;
		font-size: 0.8125rem;
		opacity: 0.9;
	}

	.error-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		line-height: 0.5;
		color: inherit;
		opacity: 0.6;
		cursor: pointer;
		padding: 0.25rem;
	}
	
	.error-close:hover {
		opacity: 1;
	}
</style>
