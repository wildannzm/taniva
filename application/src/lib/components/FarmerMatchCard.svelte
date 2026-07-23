<script>
	let { match, onSelect } = $props();
</script>

<div class="match-card card">
	<div class="match-header">
		<div class="farmer-info">
			<div class="farmer-avatar">🧑‍🌾</div>
			<div>
				<h3 class="farmer-name">{match.allocations.map((/** @type {any} */ a) => a.farmer.name).join(' & ')}</h3>
				{#if match.type === 'split'}
					<span class="badge-verified" style="font-size: 0.625rem; padding: 0.125rem 0.5rem; background: #e3f2fd; color: #1976d2;">Split Order</span>
				{:else}
					<span class="badge-verified" style="font-size: 0.625rem; padding: 0.125rem 0.5rem;">Terverifikasi</span>
				{/if}
			</div>
		</div>
		<div class="total-score">
			<span class="score-val">{(match.score?.total || 0).toFixed(1)}</span>
			<span class="score-label">Skor Total</span>
		</div>
	</div>
	
	{#if match.penjelasan_nlp}
		<p class="nlp-explanation">{match.penjelasan_nlp}</p>
	{/if}
	
	<div class="breakdown-list">
		<!-- Kualitas 40% -->
		<div class="score-row">
			<div class="score-meta">
				<span class="score-name">Kualitas (40%)</span>
				<span class="score-num">{(match.score?.aggregateQuality || 0).toFixed(0)}</span>
			</div>
			<div class="score-bar-track">
				<div class="score-bar-fill score-bar-fill-quality" style="width: {match.score?.aggregateQuality || 0}%;"></div>
			</div>
		</div>
		
		<!-- Reputasi 35% -->
		<div class="score-row">
			<div class="score-meta">
				<span class="score-name">Reputasi (35%)</span>
				<span class="score-num">{(match.score?.aggregateReputation || 0).toFixed(0)}</span>
			</div>
			<div class="score-bar-track">
				<div class="score-bar-fill score-bar-fill-reputation" style="width: {match.score?.aggregateReputation || 0}%;"></div>
			</div>
		</div>
		
		<!-- Logistik 25% -->
		<div class="score-row">
			<div class="score-meta">
				<span class="score-name">Logistik (25%)</span>
				<span class="score-num">{(match.score?.aggregateLogistics || 0).toFixed(0)}</span>
			</div>
			<div class="score-bar-track">
				<div class="score-bar-fill score-bar-fill-logistics" style="width: {match.score?.aggregateLogistics || 0}%;"></div>
			</div>
		</div>

		<!-- Jarak dan Biaya -->
		<div class="additional-info" style="margin-top: 0.5rem; display: flex; justify-content: space-between; font-size: 0.8125rem; background: var(--color-surface); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--color-outline-variant);">
			<div style="display: flex; flex-direction: column;">
				<span style="color: var(--color-on-surface-variant); font-size: 0.6875rem;">Total Jarak</span>
				<span style="font-weight: 600; color: var(--color-on-surface);">
					{(match.allocations?.reduce((/** @type {any} */ acc, /** @type {any} */ a) => acc + (a.logistics?.distanceKm || 0), 0) || 0).toFixed(1)} km
				</span>
			</div>
			<div style="display: flex; flex-direction: column; text-align: right;">
				<span style="color: var(--color-on-surface-variant); font-size: 0.6875rem;">Estimasi Biaya</span>
				<strong>Rp {(match.grandTotal || 0).toLocaleString('id-ID')}</strong>
			</div>
		</div>
	</div>
	
	<div class="match-actions">
		<button class="btn btn-primary" style="width: 100%;" onclick={() => onSelect(match)}>Pilih & Lihat Rute</button>
	</div>
</div>

<style>
	.match-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.match-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.farmer-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.farmer-avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-full);
		background: var(--color-surface-container-high);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.farmer-name {
		margin: 0 0 0.125rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.total-score {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		background: var(--color-primary-container);
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-sm);
	}

	.score-val {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1.1;
	}

	.score-label {
		font-size: 0.625rem;
		color: var(--color-on-primary-container);
		font-weight: 500;
		text-transform: uppercase;
	}

	.nlp-explanation {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant);
		background: var(--color-surface);
		padding: 0.75rem;
		border-radius: var(--radius-sm);
		border-left: 3px solid #2196f3;
		font-style: italic;
	}

	.breakdown-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.score-row {
		display: flex;
		flex-direction: column;
	}

	.score-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}

	.score-name {
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
		font-weight: 500;
	}

	.score-num {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-on-surface);
	}
</style>
