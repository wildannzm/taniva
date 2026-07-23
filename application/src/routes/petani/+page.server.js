import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const { user } = await parent();
	
	if (!user || user.role !== 'FARMER') {
		return {
			stats: {
				totalPanenTerjual: 0,
				rataKualitas: 0,
				reputasi: 0
			},
			recentHarvests: []
		};
	}

	const farmer = await prisma.farmer.findUnique({
		where: { userId: user.id },
		include: {
			harvestBatches: {
				orderBy: { createdAt: 'desc' },
				include: { certificate: true }
			},
			ratings: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});

	if (!farmer) {
		return {
			stats: {
				totalPanenTerjual: 0,
				rataKualitas: 0,
				reputasi: 0,
				ratingCount: 0
			},
			recentHarvests: []
		};
	}

	// Hitung total panen terjual
	const soldBatches = farmer.harvestBatches.filter(/** @param {any} b */ (b) => b.status === 'SOLD');
	const totalPanenTerjual = soldBatches.reduce(/** @param {number} acc @param {any} batch */ (acc, batch) => acc + Number(batch.quantityKg), 0);

	// Hitung rata-rata kualitas (semua batch yang sudah ada skor)
	const scoredBatches = farmer.harvestBatches.filter(/** @param {any} b */ (b) => b.qualityScore !== null);
	const rataKualitas = scoredBatches.length > 0 
		? scoredBatches.reduce(/** @param {number} acc @param {any} batch */ (acc, batch) => acc + Number(batch.qualityScore), 0) / scoredBatches.length 
		: 0;

	// Hitung reputasi dari rating sesungguhnya (skala 1-5 dari UMKM, dikonversi ke skala 100)
	const ratings = farmer.ratings;
	let reputasi = 0;
	if (ratings.length > 0) {
		const avgScore = ratings.reduce(/** @param {number} acc @param {any} r */ (acc, r) => acc + r.score, 0) / ratings.length;
		reputasi = Math.round(avgScore * 20 * 10) / 10; // skala 1-5 → 0-100
	}

	// Ambil 3 riwayat terbaru
	const recentHarvests = farmer.harvestBatches.slice(0, 3).map(/** @param {any} batch */ (batch) => ({
		id: batch.id.split('-')[0].toUpperCase(),
		date: batch.createdAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
		quality: Number(batch.qualityScore) || 0,
		weight: `${Number(batch.quantityKg)} kg`,
		status: batch.status === 'AVAILABLE' ? 'verified' : (batch.status === 'SOLD' ? 'verified' : 'alert'),
		certificateCode: batch.certificate?.certificateCode || null
	}));

	return {
		stats: {
			totalPanenTerjual,
			rataKualitas: Math.round(rataKualitas * 10) / 10,
			reputasi,
			ratingCount: ratings.length
		},
		recentHarvests
	};
}
