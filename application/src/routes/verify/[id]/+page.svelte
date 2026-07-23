<script>
	let { data } = $props();
</script>

<div class="verify-page">
	<div class="verify-container">
		<!-- Header -->
		<header class="verify-header">
			<div class="shield-icon">🛡️</div>
			<h1>Sertifikat Digital Taniva</h1>
			<span class="badge-verified">✅ Valid & Terverifikasi</span>
		</header>

		<!-- Content -->
		<main class="verify-content">
			<!-- Detail Panen -->
			<section class="info-section">
				<h2 class="section-title">Detail Panen</h2>
				<div class="detail-grid">
					<div class="detail-item">
						<span class="dlabel">ID Sertifikat</span>
						<span class="dvalue mono">{data.certificate.code}</span>
					</div>
					<div class="detail-item">
						<span class="dlabel">Komoditas</span>
						<span class="dvalue" style="text-transform:capitalize">{data.batch.commodity}</span>
					</div>
					<div class="detail-item">
						<span class="dlabel">Petani</span>
						<span class="dvalue">{data.batch.farmerName}</span>
					</div>
					<div class="detail-item">
						<span class="dlabel">Tanggal Diterbitkan</span>
						<span class="dvalue">{new Date(data.certificate.issuedAt).toLocaleString('id-ID')}</span>
					</div>
					<div class="detail-item">
						<span class="dlabel">Volume</span>
						<span class="dvalue">{data.batch.quantityKg} kg</span>
					</div>
				</div>
			</section>

			<!-- Hasil Analisis Kualitas AI -->
			<section class="info-section last">
				<h2 class="section-title">Hasil Analisis Kualitas AI</h2>
				<div class="score-display">
					<div class="score-circle score-{data.batch.qualityScore >= 90 ? 'a' : data.batch.qualityScore >= 80 ? 'b' : 'c'}">
						{data.batch.qualityScore}
					</div>
					<div class="score-text">
						<div class="score-label">Skor Kualitas</div>
						<div class="score-grade">GRADE {data.batch.qualityScore >= 90 ? 'A (PREMIUM)' : data.batch.qualityScore >= 80 ? 'B (STANDAR)' : 'C (DI BAWAH STANDAR)'}</div>
					</div>
				</div>
			</section>
		</main>

		<!-- Footer -->
		<footer class="verify-footer">
			<a href="/petani" class="btn-home">Kembali ke Dashboard</a>
		</footer>
	</div>
</div>

<style>
	.verify-page {
		min-height: 100dvh;
		background: #f0f4f1;
		padding: 2rem 1rem;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		font-family: var(--font-sans, system-ui, sans-serif);
	}

	.verify-container {
		background: #ffffff;
		width: 100%;
		max-width: 600px;
		border-radius: 1rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		animation: fadeInUp 0.5s ease-out forwards;
	}

	.verify-header {
		background: #0a2e11;
		color: white;
		text-align: center;
		padding: 2.5rem 1.5rem;
	}

	.shield-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.verify-header h1 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.badge-verified {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #e8f5e9;
		color: #2e7d32;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.verify-content {
		padding: 2rem;
	}

	.info-section {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px dashed #e0e0e0;
	}

	.info-section.last {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 1.25rem 0;
	}

	.detail-grid {
		display: grid;
		gap: 0.75rem;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.dlabel {
		color: #666;
		font-size: 0.875rem;
	}

	.dvalue {
		font-weight: 600;
		color: #1a1a1a;
	}

	.mono {
		font-family: monospace;
		background: #e5e7eb;
		padding: 0.2rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.85rem;
	}

	.score-display {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 0.75rem;
	}

	.score-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: 800;
		color: white;
		flex-shrink: 0;
	}

	.score-a { background: #2e7d32; }
	.score-b { background: #f57f17; }
	.score-c { background: #c62828; }

	.score-label {
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 0.25rem;
	}

	.score-grade {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.verify-footer {
		padding: 1.5rem;
		background: #f9fafb;
		text-align: center;
		border-top: 1px solid #e0e0e0;
	}

	.btn-home {
		display: inline-block;
		text-decoration: none;
		color: #2e7d32;
		font-weight: 600;
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		background: #e8f5e9;
		transition: background 0.2s;
	}

	.btn-home:hover {
		background: #c8e6c9;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 600px) {
		.detail-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}
	}
</style>
