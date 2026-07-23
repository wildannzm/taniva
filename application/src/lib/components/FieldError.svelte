<script>
	let { error } = $props();
</script>

{#if error}
	<span class="field-error">{error}</span>
{/if}

<style>
	.field-error {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-error, #dc3545);
	}
</style>
