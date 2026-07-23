import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';

/** 
 * @param {{ params: any, url: URL }} requestEvent 
 */
export async function GET({ params, url }) {
	const { batchId } = params;
	const requestHash = url.searchParams.get('hash');

	if (!requestHash) {
		return json(
			{
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Parameter hash wajib disertakan.',
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: 400 }
		);
	}

	try {
		const certificate = await prisma.certificate.findUnique({
			where: { batchId },
			include: {
				batch: {
					include: {
						farmer: true
					}
				}
			}
		});

		if (!certificate) {
			return json(
				{
					success: false,
					error: {
						code: 'NOT_FOUND',
						message: 'Sertifikat tidak ditemukan untuk batch ini.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 404 }
			);
		}

		const isValid = certificate.hashSha256 === requestHash;

		return json({
			success: true,
			data: {
				valid: isValid,
				certificateCode: certificate.certificateCode,
				batch: {
					batchId: certificate.batchId,
					farmerName: certificate.batch.farmer.farmName,
					commodity: certificate.batch.commodity,
					quantityKg: Number(certificate.batch.quantityKg),
					qualityScore: Number(certificate.batch.qualityScore),
					qualityLabel: certificate.batch.qualityLabel,
					issuedAt: certificate.issuedAt.toISOString()
				}
			}
		});
	} catch (err) {
		console.error('Verify Certificate Error:', err);
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
