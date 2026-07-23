<script>
	import { onDestroy } from 'svelte';
	
	let { onFileSelect } = $props();
	
	let isDragging = $state(false);
	/** @type {string | null} */
	let previewUrl = $state(null);
	/** @type {HTMLInputElement} */
	let fileInput;

	/**
	 * @param {DragEvent} e
	 */
	function handleDragOver(e) {
		e.preventDefault();
		isDragging = true;
	}

	/**
	 * @param {DragEvent} e
	 */
	function handleDragLeave(e) {
		e.preventDefault();
		isDragging = false;
	}

	/**
	 * @param {DragEvent} e
	 */
	function handleDrop(e) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFile(e.dataTransfer.files[0]);
		}
	}

	/**
	 * @param {Event} e
	 */
	function handleFileSelect(e) {
		const target = /** @type {HTMLInputElement} */ (e.target);
		if (target.files && target.files.length > 0) {
			processFile(target.files[0]);
		}
	}

	/**
	 * @param {File} file
	 */
	function processFile(file) {
		if (file.type.startsWith('image/')) {
			cleanupPreview();
			previewUrl = URL.createObjectURL(file);
			onFileSelect(file);
		} else {
			alert('Mohon unggah file gambar (.jpg, .png)');
		}
	}
	
	function cleanupPreview() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
	}

	function resetFile() {
		cleanupPreview();
		if (fileInput) fileInput.value = '';
		onFileSelect(null);
	}
	
	onDestroy(() => {
		cleanupPreview();
	});
</script>

<div class="uploader-wrapper">
	<input
		type="file"
		accept="image/*"
		class="file-input"
		bind:this={fileInput}
		onchange={handleFileSelect}
		id="file-upload"
	/>
	
	{#if previewUrl}
		<div class="preview-container animate-scale-in">
			<img src={previewUrl} alt="Preview tomat" class="preview-img" />
			<button class="btn-change" onclick={resetFile}>Ganti Foto</button>
		</div>
	{:else}
		<div
			class="dropzone"
			class:dropzone-active={isDragging}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={() => fileInput.click()}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
		>
			<div class="upload-icon">📸</div>
			<p class="upload-title">Unggah Foto Panen</p>
			<p class="upload-desc">Klik atau seret file gambar ke sini<br>(JPG, PNG maksimal 5MB)</p>
		</div>
	{/if}
</div>

<style>
	.uploader-wrapper {
		width: 100%;
		max-width: 28rem;
		margin: 0 auto;
	}

	.file-input {
		display: none;
	}

	.dropzone {
		border: 2px dashed var(--color-outline-variant);
		border-radius: var(--radius-card);
		padding: 2.5rem 1.5rem;
		text-align: center;
		cursor: pointer;
		background: var(--color-surface-container-lowest);
		transition: all var(--duration-normal) var(--ease-smooth);
	}

	.dropzone:hover, .dropzone-active {
		border-color: var(--color-primary);
		background: var(--color-primary-container);
	}

	.upload-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		opacity: 0.8;
	}

	.upload-title {
		font-weight: 600;
		color: var(--color-on-surface);
		margin: 0 0 0.5rem;
	}

	.upload-desc {
		font-size: 0.8125rem;
		color: var(--color-on-surface-variant);
		margin: 0;
		line-height: 1.4;
	}

	.preview-container {
		position: relative;
		border-radius: var(--radius-card);
		overflow: hidden;
		border: 1px solid var(--color-outline-variant);
		background: var(--color-surface-container-low);
	}

	.preview-img {
		width: 100%;
		height: auto;
		max-height: 16rem;
		object-fit: cover;
		display: block;
	}

	.btn-change {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-outline-variant);
		padding: 0.5rem 1rem;
		border-radius: var(--radius-full);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-on-surface);
		cursor: pointer;
		transition: background var(--duration-fast) var(--ease-smooth);
	}

	.btn-change:hover {
		background: #fff;
	}
</style>
