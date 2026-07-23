<script>
	let { id } = $props();
</script>

{#if id}
	<div class="request-id">
		<span>ReqID: {id}</span>
	</div>
{/if}

<style>
	.request-id {
		display: inline-block;
		margin-top: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.7rem;
		color: inherit;
		opacity: 0.7;
	}
</style>
