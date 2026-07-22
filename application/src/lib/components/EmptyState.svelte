<script>
	let { icon = "📭", title = "Belum Ada Data", desc = "Data akan muncul di sini" } = $props();
</script>

<div class="empty-state">
	<div class="empty-icon">{icon}</div>
	<h3 class="empty-title">{title}</h3>
	<p class="empty-desc">{desc}</p>
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1.5rem;
		text-align: center;
		background: var(--color-surface-container-lowest);
		border: 1.5px dashed var(--color-outline-variant);
		border-radius: var(--radius-card);
	}

	.empty-icon {
		font-size: 3rem;
		opacity: 0.5;
		margin-bottom: 1rem;
		filter: grayscale(0.5);
	}

	.empty-title {
		margin: 0 0 0.25rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.empty-desc {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-on-surface-variant);
	}
</style>
