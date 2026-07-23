<script>
	let { message = "Layanan sedang mengalami gangguan ringan.", type = "warning" } = $props();
</script>

<div class="fallback-notice {type}">
	<span class="icon">
		{#if type === 'warning'}⚠️{:else if type === 'info'}ℹ️{/if}
	</span>
	<span class="message">{message}</span>
</div>

<style>
	.fallback-notice {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
		border-radius: var(--radius-card);
		font-size: 0.875rem;
	}

	.warning {
		background: var(--color-warning-container, #fff3cd);
		color: var(--color-on-warning-container, #856404);
		border: 1px solid #ffeeba;
	}

	.info {
		background: var(--color-info-container, #d1ecf1);
		color: var(--color-on-info-container, #0c5460);
		border: 1px solid #bee5eb;
	}

	.icon {
		margin-right: 0.5rem;
	}

	.message {
		flex: 1;
	}
</style>
