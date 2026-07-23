import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';

/** 
 * @param {{ params: any }} requestEvent 
 */
export async function GET({ params }) {
	const { batchId } = params;

	try {
		const batch = await prisma.harvestBatch.findUnique({
			where: { id: batchId },
			include: {
				certificate: true,
				farmer: {
					select: {
						id: true,
						farmName: true,
						reputationScore: true
					}
				}
			}
		});

		if (!batch) {
			return json(
				{
					success: false,
					error: {
						code: 'NOT_FOUND',
						message: 'Batch tidak ditemukan',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: {
				batchId: batch.id,
				commodity: batch.commodity,
				quantityKg: Number(batch.quantityKg),
				remainingQuantityKg: Number(batch.remainingQuantityKg),
				pricePerKg: batch.pricePerKg,
				status: batch.status,
				farmer: {
					id: batch.farmer.id,
					name: batch.farmer.farmName,
					reputationScore: Number(batch.farmer.reputationScore)
				},
				quality: {
					score: Number(batch.qualityScore),
					label: batch.qualityLabel,
					freshCount: batch.freshCount,
					rottenCount: batch.rottenCount,
					totalDetected: batch.totalDetected,
					annotatedImageUrl: batch.annotatedImageUrl
				},
				certificate: batch.certificate
					? {
							code: batch.certificate.certificateCode,
							hash: batch.certificate.hashSha256,
							verifyUrl: batch.certificate.verifyUrl,
							qrImageUrl: batch.certificate.qrImageUrl
						}
					: null
			}
		});
	} catch (err) {
		console.error('Get Harvest Batch Error:', err);
		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Error internal yang tidak diekspos',
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: 500 }
		);
	}
}
