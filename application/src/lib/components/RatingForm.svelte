<script>
	let { onSubmit, disabled = false } = $props();

	let rating = $state(0);
	let hoverRating = $state(0);
	let review = $state('');

	/** @param {number} val */
	function setRating(val) {
		if (disabled) return;
		rating = val;
	}

	/** @param {Event} e */
	function handleSubmit(e) {
		e.preventDefault();
		if (rating > 0) {
			onSubmit(rating, review);
		}
	}
</script>

<div class="rating-card card">
	<div class="rating-header">
		<h3 class="rating-title">Beri Penilaian</h3>
		<p class="rating-desc">Bantu sistem kami memperbaiki rekomendasi dengan menilai kualitas tomat dari petani ini.</p>
	</div>

	<form onsubmit={handleSubmit}>
		<div class="stars-container" role="group" onmouseleave={() => hoverRating = 0}>
			{#each [1, 2, 3, 4, 5] as star}
				<button
					type="button"
					class="star-btn"
					class:active={star <= (hoverRating || rating)}
					onmouseenter={() => hoverRating = star}
					onclick={() => setRating(star)}
					{disabled}
					aria-label="Beri rating {star} bintang"
				>
					<svg viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? '#f9a825' : 'none'} stroke={star <= (hoverRating || rating) ? '#f9a825' : 'var(--color-outline-variant)'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
					</svg>
				</button>
			{/each}
		</div>
		
		<div class="rating-label">
			{#if rating === 1}Sangat Buruk
			{:else if rating === 2}Buruk
			{:else if rating === 3}Cukup
			{:else if rating === 4}Baik
			{:else if rating === 5}Sangat Baik
			{:else}Pilih bintang{/if}
		</div>

		<textarea
			class="review-input"
			placeholder="Catatan tambahan (opsional)"
			bind:value={review}
			rows="3"
			{disabled}
		></textarea>

		<button 
			type="submit" 
			class="btn btn-primary submit-btn"
			disabled={disabled || rating === 0}
		>
			Kirim Ulasan
		</button>
	</form>
</div>

<style>
	.rating-card {
		max-width: 24rem;
		margin: 0 auto;
		text-align: center;
	}

	.rating-title {
		margin: 0 0 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.rating-desc {
		margin: 0 0 1.5rem;
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant);
	}

	.stars-container {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.star-btn {
		background: none;
		border: none;
		padding: 0.25rem;
		cursor: pointer;
		width: 3rem;
		height: 3rem;
		transition: transform 0.1s;
	}

	.star-btn:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.star-btn:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.star-btn svg {
		width: 100%;
		height: 100%;
		transition: fill 0.2s, stroke 0.2s;
	}

	.rating-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-primary);
		min-height: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.review-input {
		width: 100%;
		padding: 0.75rem;
		border: 1.5px solid var(--color-outline-variant);
		border-radius: var(--radius-sm);
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: var(--color-on-surface);
		resize: none;
		outline: none;
		margin-bottom: 1rem;
		background: var(--color-surface-container-lowest);
	}

	.review-input:focus {
		border-color: var(--color-primary);
	}

	.submit-btn {
		width: 100%;
	}
</style>
