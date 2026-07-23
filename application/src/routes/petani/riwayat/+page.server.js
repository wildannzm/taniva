import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const { user } = await parent();
	
	if (!user || user.role !== 'FARMER') {
		return { harvests: [] };
	}

	const farmer = await prisma.farmer.findUnique({
		where: { userId: user.id },
		include: {
			harvestBatches: {
				orderBy: { createdAt: 'desc' },
				include: { certificate: true }
			}
		}
	});

	if (!farmer) {
		return { harvests: [] };
	}

	const harvests = farmer.harvestBatches.map(batch => ({
		id: batch.id.split('-')[0].toUpperCase(),
		date: batch.createdAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
		quality: Number(batch.qualityScore) || 0,
		weight: `${Number(batch.quantityKg)} kg`,
		status: batch.status === 'AVAILABLE' ? 'verified' : (batch.status === 'SOLD' ? 'verified' : 'alert'),
		certificateCode: batch.certificate?.certificateCode || null
	}));

	return { harvests };
}
