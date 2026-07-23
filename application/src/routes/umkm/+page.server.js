import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const { user } = await parent();

	if (!user || user.role !== 'UMKM') {
		return {
			stats: { volumeBulanIni: 0, tingkatKepuasan: 0 },
			recentOrders: []
		};
	}

	const umkm = await prisma.umkm.findUnique({
		where: { userId: user.id },
		include: {
			orders: {
				orderBy: { createdAt: 'desc' },
				include: {
					selectedBatch: {
						include: {
							farmer: {
								include: { user: true }
							}
						}
					}
				}
			},
			ratings: {
				orderBy: { createdAt: 'desc' }
			}
		}
	});

	if (!umkm) {
		return {
			stats: { volumeBulanIni: 0, tingkatKepuasan: 0 },
			recentOrders: []
		};
	}

	// Hitung volume bulan ini (orders bulan ini yang sudah COMPLETED/RECEIVED)
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const ordersThisMonth = umkm.orders.filter(
		/** @param {any} o */ (o) => new Date(o.createdAt) >= startOfMonth && (o.status === 'COMPLETED' || o.status === 'RECEIVED')
	);
	const volumeBulanIni = ordersThisMonth.reduce(
		/** @param {number} acc @param {any} o */ (acc, o) => acc + Number(o.quantityKg), 0
	);

	// Hitung tingkat kepuasan dari rating yang diberikan UMKM ini
	const ratings = umkm.ratings;
	let tingkatKepuasan = 0;
	if (ratings.length > 0) {
		const avgScore = ratings.reduce(
			/** @param {number} acc @param {any} r */ (acc, r) => acc + r.score, 0
		) / ratings.length;
		tingkatKepuasan = Math.round(avgScore * 20); // skala 1-5 → 0-100%
	}

	// Ambil 3 pesanan terbaru
	const recentOrders = umkm.orders.slice(0, 3).map(/** @param {any} order */ (order) => ({
		id: order.id.split('-')[0].toUpperCase(),
		date: order.createdAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
		farmer: order.selectedBatch?.farmer?.user?.name || '-',
		weight: `${Number(order.quantityKg)} kg`,
		status: order.status === 'COMPLETED' || order.status === 'RECEIVED' ? 'completed' : 'pending'
	}));

	return {
		stats: {
			volumeBulanIni,
			tingkatKepuasan
		},
		recentOrders
	};
}
