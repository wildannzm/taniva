<script>
	let { onSelect } = $props();

	/**
	 * @param {string} role
	 */
	function selectRole(role) {
		onSelect(role);
	}
</script>

<div class="role-grid">
	<button
		class="role-card"
		onclick={() => selectRole('petani')}
		id="role-petani"
	>
		<div class="role-icon role-icon-farmer">🧑‍🌾</div>
		<span class="role-title">Petani</span>
		<span class="role-desc">Jual hasil panen tomat berkualitas</span>
	</button>

	<button
		class="role-card"
		onclick={() => selectRole('umkm')}
		id="role-umkm"
	>
		<div class="role-icon role-icon-sme">🍽️</div>
		<span class="role-title">UMKM</span>
		<span class="role-desc">Temukan pasokan tomat terpercaya</span>
	</button>
</div>

<style>
	.role-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.role-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem 0.75rem;
		border: 1.5px solid var(--color-outline-variant);
		border-radius: var(--radius-card);
		background: var(--color-surface-container-lowest);
		cursor: pointer;
		transition: all var(--duration-normal) var(--ease-smooth);
		font-family: var(--font-sans);
		text-align: center;
	}

	.role-card:hover {
		border-color: var(--color-primary);
		background: var(--color-primary-container);
		transform: translateY(-2px);
		box-shadow: var(--shadow-card-hover);
	}

	.role-icon {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		transition: transform var(--duration-normal) var(--ease-smooth);
	}

	.role-card:hover .role-icon {
		transform: scale(1.1);
	}

	.role-icon-farmer {
		background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	}

	.role-icon-sme {
		background: linear-gradient(135deg, #fff8e1, #ffecb3);
	}

	.role-title {
		font-weight: 600;
		font-size: 1rem;
		color: var(--color-on-surface);
	}

	.role-desc {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
		line-height: 1.3;
	}
</style>
