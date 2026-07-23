import { prisma } from '$lib/server/db/prisma';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { id } = params;

	const certificate = await prisma.certificate.findUnique({
		where: { certificateCode: id },
		include: {
			batch: {
				include: {
					farmer: true
				}
			}
		}
	});

	if (!certificate) {
		throw error(404, 'Sertifikat tidak ditemukan atau tidak valid.');
	}

	return {
		certificate: {
			code: certificate.certificateCode,
			hash: certificate.hashSha256,
			verifyUrl: certificate.verifyUrl,
			issuedAt: certificate.issuedAt,
			snapshot: certificate.snapshotJson
		},
		batch: {
			id: certificate.batch.id,
			commodity: certificate.batch.commodity,
			quantityKg: Number(certificate.batch.quantityKg),
			qualityScore: Number(certificate.batch.qualityScore),
			qualityLabel: certificate.batch.qualityLabel,
			annotatedImageUrl: certificate.batch.annotatedImageUrl,
			farmerName: certificate.batch.farmer.user?.name || 'Petani Taniva'
		}
	};
}
