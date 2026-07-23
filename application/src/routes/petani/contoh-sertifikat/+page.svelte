<script>
	import html2canvas from 'html2canvas';
	import { jsPDF } from 'jspdf';

	// Mockup data
	const cert = {
		id: "TNV-2026-07-8891A",
		farmerName: "Budi Santoso",
		commodity: "Tomat",
		weight: "150 kg",
		grade: "A",
		score: 95,
		date: "23 Juli 2026",
		location: "Lembang, Jawa Barat"
	};

	let isDownloading = $state(false);

	async function downloadPDF() {
		isDownloading = true;
		try {
			const certElement = document.getElementById('printable-certificate');
			if (!certElement) return;
			
			// Render element to canvas
			const canvas = await html2canvas(certElement, { 
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff'
			});
			
			const imgData = canvas.toDataURL('image/png');
			
			// A4 Landscape size: 297 x 210 mm
			const pdf = new jsPDF('l', 'mm', 'a4');
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			
			pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
			pdf.save(`Sertifikat_Taniva_${cert.id}.pdf`);
		} catch (err) {
			console.error("Gagal mengunduh PDF:", err);
			alert("Gagal mengunduh sertifikat.");
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="page-layout">
	<div class="container animate-fade-in-up">
		<div class="header-nav">
			<a href="/petani" class="back-link">← Kembali ke Dashboard</a>
			<button class="btn-primary" onclick={downloadPDF} disabled={isDownloading}>
				{isDownloading ? 'Memproses...' : 'Unduh PDF'}
			</button>
		</div>
		
		<div class="certificate-wrapper">
			<div class="certificate" id="printable-certificate">
				<div class="cert-inner-border">
					
					<!-- Header -->
					<div class="cert-header">
						<div class="header-left">
							<div class="logo">TANIVA</div>
							<p class="subtitle">Platform Agrikultur Presisi</p>
						</div>
						<div class="header-right">
							<p class="cert-id">No. Dokumen:<br/><strong>{cert.id}</strong></p>
						</div>
					</div>
					
					<!-- Title -->
					<div class="cert-title">
						<h1>Sertifikat Kualitas Panen</h1>
						<div class="title-divider"></div>
					</div>
					
					<!-- Content -->
					<div class="cert-body">
						<div class="info-section">
							<p class="intro">Menerangkan bahwa hasil panen dari:</p>
							<h2 class="farmer-name">{cert.farmerName}</h2>
							
							<div class="detail-grid">
								<div class="detail-row">
									<span class="label">Komoditas</span>
									<span class="dots"></span>
									<span class="value">{cert.commodity}</span>
								</div>
								<div class="detail-row">
									<span class="label">Total Kuantitas</span>
									<span class="dots"></span>
									<span class="value">{cert.weight}</span>
								</div>
								<div class="detail-row">
									<span class="label">Tanggal Panen</span>
									<span class="dots"></span>
									<span class="value">{cert.date}</span>
								</div>
								<div class="detail-row">
									<span class="label">Lokasi Lahan</span>
									<span class="dots"></span>
									<span class="value">{cert.location}</span>
								</div>
							</div>
						</div>
						
						<!-- Grade & QR -->
						<div class="verification-section">
							<div class="seal-badge">
								<div class="seal-content">
									<span class="seal-text-top">GRADE</span>
									<span class="seal-grade">{cert.grade}</span>
									<span class="seal-score">Skor: {cert.score}</span>
								</div>
							</div>
							
							<div class="qr-code-area">
								<div class="qr-placeholder">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
									</svg>
								</div>
								<p class="qr-text">Scan Verifikasi</p>
							</div>
						</div>
					</div>
					
					<!-- Footer -->
					<div class="cert-footer">
						<div class="signature-area">
							<p class="sig-title">Disahkan Secara Digital</p>
							<div class="sig-line">Sistem AI Taniva</div>
							<p class="sig-date">{cert.date}</p>
						</div>
						<p class="disclaimer">Dokumen ini merupakan jejak digital asli yang tercatat secara permanen di sistem Taniva. Data dapat diverifikasi menggunakan QR Code di atas.</p>
					</div>
					
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.page-layout {
		min-height: 100dvh;
		background: #f1f5f9;
		padding: 2rem 1.5rem;
		font-family: var(--font-sans, system-ui, sans-serif);
		color: #0f172a;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.header-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.back-link {
		color: #1b5e20;
		text-decoration: none;
		font-weight: 700;
	}

	.btn-primary {
		padding: 0.6rem 1.5rem;
		background: #1b5e20;
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 700;
		cursor: pointer;
	}

	.certificate-wrapper {
		display: flex;
		/* Hapus justify-content: center agar sisi kiri tidak terpotong saat di-scroll */
		overflow-x: auto;
		padding-bottom: 2rem;
		width: 100%;
	}

	.certificate {
		background: #ffffff;
		width: 1123px;
		height: 794px;
		min-width: 1123px;
		min-height: 794px;
		position: relative;
		margin: 0 auto; /* Tengah jika ruang cukup, tidak potong kiri jika kurang */
		padding: 1.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
		background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
		background-size: 20px 20px;
		display: flex;
		flex-direction: column;
	}

	.cert-inner-border {
		border: 4px double #1b5e20;
		padding: 3rem;
		background: #ffffff;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.cert-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
	}

	.logo {
		font-family: 'Times New Roman', serif;
		font-size: 2rem;
		font-weight: 900;
		letter-spacing: 0.15em;
		color: #1b5e20;
		line-height: 1;
	}

	.subtitle {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.header-right { text-align: right; }

	.cert-id {
		margin: 0;
		font-size: 0.8125rem;
		color: #475569;
	}

	.cert-id strong {
		font-family: monospace;
		font-size: 1rem;
		color: #1b5e20;
	}

	.cert-title {
		text-align: center;
		margin-bottom: 3rem;
	}

	.cert-title h1 {
		font-family: 'Georgia', 'Times New Roman', serif;
		font-size: 2.5rem;
		font-weight: normal;
		color: #0f172a;
		margin: 0 0 1rem;
		letter-spacing: 0.02em;
	}

	.title-divider {
		width: 100px;
		height: 2px;
		background: #1b5e20;
		margin: 0 auto;
	}

	.cert-body {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		margin-bottom: 3rem;
		flex: 1;
	}

	@media (min-width: 640px) {
		.cert-body {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.info-section {
		flex: 1;
	}

	.intro {
		color: #475569;
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-style: italic;
	}

	.farmer-name {
		font-size: 2rem;
		font-weight: 800;
		color: #1b5e20;
		margin: 0 0 2rem;
		font-family: 'Georgia', serif;
	}

	.detail-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 400px;
	}

	.detail-row {
		display: flex;
		align-items: baseline;
		font-size: 1.125rem;
	}

	.detail-row .label {
		font-weight: 600;
		color: #475569;
		white-space: nowrap;
	}

	.detail-row .dots {
		flex: 1;
		border-bottom: 1px dotted #cbd5e1;
		margin: 0 0.5rem;
	}

	.detail-row .value {
		font-weight: 800;
		color: #0f172a;
	}

	.verification-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.seal-badge {
		position: relative;
		width: 140px;
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.seal-stamp {
		position: absolute;
		top: 0; left: 0; width: 100%; height: 100%;
		opacity: 0.9;
		animation: slowSpin 20s linear infinite;
	}

	.seal-content {
		position: relative;
		z-index: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #ffffff;
		border-radius: 50%;
		width: 70px;
		height: 70px;
		justify-content: center;
	}

	.seal-text-top {
		font-size: 0.5rem;
		font-weight: 800;
		color: #1b5e20;
		letter-spacing: 0.05em;
	}

	.seal-grade {
		font-size: 2.5rem;
		font-family: 'Georgia', serif;
		font-weight: 900;
		color: #1b5e20;
		line-height: 1;
		margin: 0;
	}

	.seal-score {
		font-size: 0.6rem;
		font-weight: 800;
		color: #1b5e20;
		border-top: 1px solid rgba(27, 94, 32, 0.3);
		padding-top: 0.15rem;
		margin-top: 0.15rem;
	}

	.qr-code-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.qr-placeholder {
		width: 90px;
		height: 90px;
		border: 2px solid #0f172a;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qr-placeholder svg {
		width: 100%;
		height: 100%;
		color: #0f172a;
	}

	.qr-text {
		margin: 0;
		font-size: 0.6875rem;
		color: #475569;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.cert-footer {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	@media (min-width: 640px) {
		.cert-footer {
			flex-direction: row-reverse;
			justify-content: space-between;
			align-items: flex-end;
		}
	}

	.signature-area {
		text-align: center;
		min-width: 200px;
	}

	.sig-title {
		margin: 0 0 3rem;
		font-size: 0.875rem;
		color: #475569;
	}

	.sig-line {
		border-top: 1px solid #0f172a;
		padding-top: 0.5rem;
		font-weight: 700;
		font-size: 1rem;
		color: #0f172a;
	}

	.sig-date {
		margin: 0.25rem 0 0;
		font-size: 0.75rem;
		color: #64748b;
	}

	.disclaimer {
		margin: 0;
		font-size: 0.75rem;
		color: #64748b;
		line-height: 1.5;
		max-width: 400px;
		text-align: justify;
	}

	@media print {
		body * { visibility: hidden; }
		#printable-certificate, #printable-certificate * { visibility: visible; }
		#printable-certificate {
			position: absolute;
			left: 0;
			top: 0;
			box-shadow: none;
			padding: 0;
			width: 100vw;
		}
		.cert-inner-border {
			border: 4px double #1b5e20 !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}
	
	.animate-fade-in-up {
		animation: fadeInUp 0.4s ease-out forwards;
	}

	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes slowSpin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
