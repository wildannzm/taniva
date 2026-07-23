<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userRole, transactionState } from '$lib/stores/app.js';
	import { searchMatching } from '$lib/api/matching.api.js';
	import { getRouteEstimate } from '$lib/api/logistics.api.js';
	import { page } from '$app/stores';
	
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import FarmerMatchCard from '$lib/components/FarmerMatchCard.svelte';
	import RouteEstimate from '$lib/components/RouteEstimate.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	userRole.set('umkm');
	
	let currentStep = $state('searching'); // 'searching' | 'results' | 'routing' | 'order_success'
	let error = $state(null);
	/** @type {any[]} */
	let matches = $state([]);
	/** @type {any} */
	let selectedMatch = $state(null);
	/** @type {any} */
	let routeData = $state(null);
	
	let orderId = $derived($page.url.searchParams.get('orderId'));
	
	onMount(() => {
		if (!orderId) {
			goto('/umkm/permintaan');
			return;
		}
		performSearch();
	});
	
	async function performSearch() {
		currentStep = 'searching';
		error = null;
		
		try {
			const { data } = await searchMatching({
				orderId: orderId
			});
			matches = data.results || [];
			transactionState.update(s => ({ ...s, matchingResults: matches }));
			currentStep = 'results';
		} catch (/** @type {any} */ err) {
			error = err.message || 'Terjadi kesalahan saat mencari petani';
			currentStep = 'results';
		}
	}
	
	function handleSelectFarmer(match) {
		selectedMatch = match;
		currentStep = 'routing';
		error = null;
		
		routeData = {
			jarak_km: match.totalDistance.toFixed(1),
			estimasi_waktu_menit: match.allocations.reduce((/** @type {number} */ acc, /** @type {any} */ a) => acc + a.candidate.route.durationMinutes, 0),
			estimasi_biaya: match.logisticsCost,
			farmerLocs: match.allocations.map((/** @type {any} */ a) => ({ 
				lat: Number(a.candidate.farmer.latitude), 
				lng: Number(a.candidate.farmer.longitude),
				name: a.candidate.farmer.name
			}))
		};
	}
	
	function confirmOrder() {
		transactionState.update(s => ({
			...s,
			selectedFarmer: selectedMatch,
			routeEstimate: routeData
		}));
		currentStep = 'order_success';
	}
</script>

<div class="page-container">
	{#if currentStep !== 'order_success'}
		<header class="page-header">
			<h1 class="page-title">
				{currentStep === 'routing' ? 'Detail Rute & Biaya' : 'Hasil Pencocokan'}
			</h1>
		</header>
	{/if}
	
	{#if error}
		<ErrorBanner message={error} onDismiss={() => error = null} />
	{/if}
	
	<div class="content-area">
		{#if currentStep === 'searching'}
			<div class="card">
				<LoadingSpinner label="Menjalankan Smart Matching Engine..." />
			</div>
			
		{:else if currentStep === 'results'}
			{#if matches.length > 0}
				<div class="matches-list animate-fade-in">
					{#each matches as match, i}
						<div style="animation-delay: {i * 100}ms;" class="animate-slide-up">
							<FarmerMatchCard {match} onSelect={handleSelectFarmer} />
						</div>
					{/each}
				</div>
			{:else}
				<EmptyState 
					icon="😞" 
					title="Tidak Ada Petani Cocok" 
					desc="Coba ubah kriteria pencarian Anda (misal: turunkan kualitas minimum atau ubah tenggat waktu)." 
				/>
				<button class="btn btn-primary mt-4" style="width: 100%;" onclick={() => goto('/umkm/permintaan')}>Kembali</button>
			{/if}
			
		{:else if currentStep === 'routing'}
			{#if !routeData}
				<div class="card">
					<LoadingSpinner label="Menghitung estimasi rute dan biaya distribusi..." />
				</div>
			{:else}
				<RouteEstimate 
					estimate={routeData} 
					onConfirm={confirmOrder}
					onCancel={() => { currentStep = 'results'; selectedMatch = null; routeData = null; }}
				/>
			{/if}
			
		{:else if currentStep === 'order_success'}
			<div class="success-card card animate-scale-in">
				<div class="success-icon">🎉</div>
				<h2 class="success-title">Pesanan Berhasil Dibuat!</h2>
				<p class="success-desc">
					Sistem telah meneruskan pesanan Anda ke <strong>{selectedMatch?.allocations?.map((/** @type {any} */ a) => a.farmer.name).join(' & ')}</strong>.
					Barang sedang disiapkan untuk dikirim.
				</p>
				<div class="success-actions">
					<button class="btn btn-ghost" onclick={() => goto('/umkm')}>Ke Dashboard</button>
					<button class="btn btn-primary" onclick={() => goto('/umkm/scan')}>Simulasi Barang Tiba (Scan)</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		padding: 1.5rem;
		max-width: 48rem;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.page-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.matches-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	
	.mt-4 { margin-top: 1rem; }
	
	.success-card {
		text-align: center;
		padding: 3rem 1.5rem;
		border-color: var(--color-primary);
	}
	
	.success-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}
	
	.success-title {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: var(--color-primary);
	}
	
	.success-desc {
		margin: 0 0 2rem;
		color: var(--color-on-surface-variant);
		line-height: 1.5;
	}
	
	.success-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
</style>
