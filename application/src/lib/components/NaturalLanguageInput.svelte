<script>
	let { onSubmit, disabled = false } = $props();
	
	let text = $state('');
	
	/** @param {Event} e */
	function handleSubmit(e) {
		e.preventDefault();
		if (text.trim()) {
			onSubmit(text.trim());
		}
	}
	
	function handleMicClick() {
		// Mock voice input for hackathon
		text = "Saya butuh 50kg tomat kualitas bagus paling lambat besok sore";
	}
</script>

<div class="nlp-input-card card">
	<div class="nlp-header">
		<span class="nlp-icon">🤖</span>
		<div>
			<h3 class="nlp-title">Asisten Pencarian</h3>
			<p class="nlp-desc">Ketik atau ucapkan kebutuhan Anda seperti sedang chat.</p>
		</div>
	</div>
	
	<form onsubmit={handleSubmit}>
		<div class="input-wrapper">
			<textarea
				class="nlp-textarea"
				placeholder="Contoh: 'Saya butuh 50kg tomat kualitas bagus paling lambat besok sore'"
				bind:value={text}
				{disabled}
				rows="3"
			></textarea>
			
			<div class="input-actions">
				<button 
					type="button" 
					class="btn-mic" 
					onclick={handleMicClick}
					{disabled}
					aria-label="Input suara"
					title="Coba contoh pesan pintar"
				>
					🎤
				</button>
				<button 
					type="submit" 
					class="btn btn-primary btn-submit"
					disabled={disabled || !text.trim()}
				>
					Kirim ↗
				</button>
			</div>
		</div>
	</form>
</div>

<style>
	.nlp-input-card {
		background: var(--color-surface-container-lowest);
	}

	.nlp-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.nlp-icon {
		width: 2.5rem;
		height: 2.5rem;
		background: #e3f2fd;
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
	}

	.nlp-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.nlp-desc {
		margin: 0;
		font-size: 0.75rem;
		color: var(--color-on-surface-variant);
	}

	.input-wrapper {
		position: relative;
		border: 1.5px solid var(--color-outline-variant);
		border-radius: var(--radius-card);
		background: var(--color-surface);
		transition: border-color var(--duration-fast) var(--ease-smooth);
	}

	.input-wrapper:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-container);
	}

	.nlp-textarea {
		width: 100%;
		border: none;
		background: transparent;
		padding: 0.75rem;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--color-on-surface);
		resize: none;
		outline: none;
	}

	.input-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid var(--color-outline-variant);
	}

	.btn-mic {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: var(--radius-full);
		transition: background var(--duration-fast) var(--ease-smooth);
	}
	
	.btn-mic:hover {
		background: var(--color-surface-container-high);
	}

	.btn-submit {
		padding: 0.375rem 1rem;
		min-height: 2rem;
		font-size: 0.875rem;
	}
</style>
