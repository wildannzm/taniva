<script>
	let { score = 0, label = "Skor Kualitas" } = $props();
	
	import { onMount } from 'svelte';
	
	let animatedScore = $state(0);
	
	onMount(() => {
		// Animate the score from 0 to target
		const duration = 1000;
		const start = performance.now();
		
		/** @param {number} time */
		function update(time) {
			const elapsed = time - start;
			const progress = Math.min(elapsed / duration, 1);
			
			// ease out cubic
			const easeProgress = 1 - Math.pow(1 - progress, 3);
			animatedScore = Math.floor(easeProgress * score);
			
			if (progress < 1) {
				requestAnimationFrame(update);
			} else {
				animatedScore = score;
			}
		}
		
		requestAnimationFrame(update);
	});

	// calculate stroke dash array for SVG circle
	const circumference = 2 * Math.PI * 52; // r=52
	$effect(() => {
		// Calculate offset for reactivity but do not return a number
		const offset = circumference - (animatedScore / 100) * circumference;
	});
</script>

<div class="quality-card card">
	<h3 class="qc-title">{label}</h3>
	
	<div class="gauge-container">
		<div class="gauge-ring">
			<svg viewBox="0 0 120 120" class="gauge-svg">
				<circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-surface-container-high)" stroke-width="10" />
				<circle
					cx="60" cy="60" r="52"
					fill="none"
					stroke={score >= 80 ? 'var(--color-primary)' : score >= 60 ? '#f57f17' : 'var(--color-error)'}
					stroke-width="10"
					stroke-linecap="round"
					stroke-dasharray="{animatedScore > 0 ? (animatedScore / 100) * circumference : 0} {circumference}"
					transform="rotate(-90 60 60)"
					class="gauge-progress"
				/>
			</svg>
			<div class="gauge-center">
				<span class="gauge-score" style="color: {score >= 80 ? 'var(--color-primary)' : score >= 60 ? '#f57f17' : 'var(--color-error)'}">{animatedScore}</span>
				<span class="gauge-max">/100</span>
			</div>
		</div>
		
		<div class="grade-badge">
			{#if score >= 80}
				<span class="grade grade-a">Grade A (Premium)</span>
			{:else if score >= 60}
				<span class="grade grade-b">Grade B (Standar)</span>
			{:else}
				<span class="grade grade-c">Grade C (Afkir)</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.quality-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.qc-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-on-surface);
		margin: 0 0 1rem;
	}

	.gauge-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.gauge-ring {
		position: relative;
		width: 9rem;
		height: 9rem;
		margin-bottom: 1rem;
	}

	.gauge-svg {
		width: 100%;
		height: 100%;
	}

	.gauge-progress {
		transition: stroke-dasharray 0.1s linear;
	}

	.gauge-center {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.gauge-score {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1;
	}

	.gauge-max {
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant);
	}
	
	.grade-badge {
		margin-top: 0.5rem;
	}
</style>
