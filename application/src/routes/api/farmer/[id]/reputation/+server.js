import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';

/**
 * @param {{ params: any }} requestEvent
 */
export async function GET({ params }) {
	const { id: farmerId } = params;

	if (!farmerId) {
		return json(
			{
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'ID Farmer wajib disertakan.',
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: 400 }
		);
	}

	try {
		const farmer = await prisma.farmer.findUnique({
			where: { id: farmerId },
			select: {
				id: true,
				farmName: true,
				reputationScore: true,
				ratingCount: true
			}
		});

		if (!farmer) {
			return json(
				{
					success: false,
					error: {
						code: 'NOT_FOUND',
						message: 'Farmer tidak ditemukan.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 404 }
			);
		}

		// Ambil history rating terbaru (opsional, batas 5)
		const recentRatings = await prisma.rating.findMany({
			where: { farmerId },
			orderBy: { createdAt: 'desc' },
			take: 5,
			select: {
				id: true,
				score: true,
				comment: true,
				createdAt: true,
				umkm: {
					select: {
						businessName: true
					}
				}
			}
		});

		return json({
			success: true,
			data: {
				farmerId: farmer.id,
				farmName: farmer.farmName,
				reputationScore: Number(farmer.reputationScore),
				ratingCount: farmer.ratingCount,
				recentRatings: recentRatings.map((/** @type {any} */ r) => ({
					ratingId: r.id,
					score: r.score,
					comment: r.comment,
					createdAt: r.createdAt.toISOString(),
					umkmName: r.umkm.businessName
				}))
			}
		});

	} catch (error) {
		console.error('Get Farmer Reputation Error:', error);
		
		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Gagal mengambil data reputasi',
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: 500 }
		);
	}
}
