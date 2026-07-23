import { json } from '@sveltejs/kit';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';
import { YoloService } from '$lib/server/services/yolo.service';
import { getConfig } from '$lib/server/config';

// 1. Zod schema for validation
const uploadSchema = z.object({
	farmerId: z.string().uuid(),
	commodity: z.literal('tomato'),
	quantityKg: z.coerce.number().positive(),
	pricePerKg: z.coerce.number().nonnegative(),
	availableDate: z
		.string()
		.optional()
		.transform((val) => (val ? new Date(val) : new Date())),
	latitude: z.coerce.number().finite().optional(),
	longitude: z.coerce.number().finite().optional()
});

/**
 * Helper to generate SHA-256 hash
 * @param {any} data
 */
function generateSHA256(data) {
	return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Generate a unique certificate code
 */
function generateCertificateCode() {
	const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
	const year = new Date().getFullYear();
	return `TNV-${year}-${randomPart}`;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
	const config = getConfig();
	const maxUploadBytes = config.MAX_UPLOAD_MB * 1024 * 1024;

	try {
		// Parse FormData
		const formData = await request.formData();
		const image = formData.get('image');

		if (!image || !(image instanceof File)) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'File gambar wajib disertakan.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 400 }
			);
		}

		// Validate File
		const validTypes = ['image/jpeg', 'image/png'];
		if (!validTypes.includes(image.type)) {
			return json(
				{
					success: false,
					error: {
						code: 'UNSUPPORTED_FILE_TYPE',
						message: 'Hanya file JPG atau PNG yang diperbolehkan.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 415 }
			);
		}

		if (image.size > maxUploadBytes) {
			return json(
				{
					success: false,
					error: {
						code: 'FILE_TOO_LARGE',
						message: `Ukuran file melebihi batas maksimal ${config.MAX_UPLOAD_MB}MB.`,
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 413 }
			);
		}

		// Validate fields
		const parsed = uploadSchema.safeParse({
			farmerId: formData.get('farmerId'),
			commodity: formData.get('commodity'),
			quantityKg: formData.get('quantityKg'),
			pricePerKg: formData.get('pricePerKg'),
			availableDate: formData.get('availableDate') || undefined,
			latitude: formData.get('latitude') || undefined,
			longitude: formData.get('longitude') || undefined
		});

		if (!parsed.success) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Data yang dikirim tidak valid.',
						details: parsed.error.issues
					},
					requestId: crypto.randomUUID()
				},
				{ status: 400 }
			);
		}

		const { farmerId, commodity, quantityKg, pricePerKg, availableDate, latitude, longitude } = parsed.data;

		// 2. Call AI Service (YOLOv8)
		let yoloResult;
		try {
			yoloResult = await YoloService.analyzeImage(image);
		} catch (error) {
			/** @type {any} */
			const err = error;
			const statusCode = err.code === 'EXTERNAL_TIMEOUT' ? 504 : err.code === 'NO_TOMATO_DETECTED' ? 422 : 502;
			return json(
				{
					success: false,
					error: {
						code: err.code || 'AI_SERVICE_ERROR',
						message: err.message || 'Respons AI invalid/gagal',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: statusCode }
			);
		}

		// We do not save image permanently to DB here. In a real app we'd upload to S3/Cloud Storage.
		// For this implementation, we use a placeholder or the original filename if no external storage is integrated.
		const originalImageUrl = `/uploads/temp-${Date.now()}-${image.name}`;

		// 3. Database Transaction
		const result = await prisma.$transaction(async (/** @type {any} */ tx) => {
			// Check if farmer exists
			const farmer = await tx.farmer.findUnique({ where: { id: farmerId } });
			if (!farmer) {
				/** @type {any} */
				const err = new Error('NOT_FOUND');
				err.code = 'NOT_FOUND';
				throw err;
			}

			// Update Farmer location if provided
			if (typeof latitude === 'number' && typeof longitude === 'number') {
				await tx.farmer.update({
					where: { id: farmerId },
					data: { latitude, longitude }
				});
			}

			// Create HarvestBatch
			const batch = await tx.harvestBatch.create({
				data: {
					farmerId,
					commodity,
					quantityKg,
					remainingQuantityKg: quantityKg,
					pricePerKg,
					availableDate,
					originalImageUrl,
					annotatedImageUrl: yoloResult.annotatedImageUrl,
					qualityScore: yoloResult.qualityScore,
					qualityLabel: yoloResult.qualityLabel.toUpperCase(),
					freshCount: yoloResult.freshCount,
					rottenCount: yoloResult.rottenCount,
					totalDetected: yoloResult.totalDetected,
					aiSource: yoloResult.source,
					aiResultJson: JSON.stringify(yoloResult), // Snapshot of AI result
					status: 'AVAILABLE'
				}
			});

			// Create Certificate Snapshot
			const certificateCode = generateCertificateCode();
			const snapshotJson = {
				batchId: batch.id,
				farmerId: batch.farmerId,
				commodity: batch.commodity,
				quantityKg: Number(batch.quantityKg),
				qualityScore: Number(batch.qualityScore),
				qualityLabel: batch.qualityLabel,
				issuedAt: new Date().toISOString()
			};

			const hashSha256 = generateSHA256(snapshotJson);
			const verifyUrl = `${config.PUBLIC_APP_URL}/verify/${certificateCode}`;
			const qrImageUrl = `/qr/${certificateCode}.png`; // Placeholder for QR generation

			const certificate = await tx.certificate.create({
				data: {
					batchId: batch.id,
					certificateCode,
					snapshotJson,
					hashSha256,
					verifyUrl,
					qrImageUrl
				}
			});

			return { batch, certificate };
		});

		// 4. Send Response
		return json(
			{
				success: true,
				data: {
					batchId: result.batch.id,
					commodity: result.batch.commodity,
					quantityKg: Number(result.batch.quantityKg),
					pricePerKg: result.batch.pricePerKg,
					quality: {
						score: Number(result.batch.qualityScore),
						label: result.batch.qualityLabel,
						freshCount: result.batch.freshCount,
						rottenCount: result.batch.rottenCount,
						totalDetected: result.batch.totalDetected,
						annotatedImageUrl: result.batch.annotatedImageUrl
					},
					certificate: {
						code: result.certificate.certificateCode,
						hash: result.certificate.hashSha256,
						verifyUrl: result.certificate.verifyUrl,
						qrImageUrl: result.certificate.qrImageUrl
					},
					status: result.batch.status
				},
				meta: {
					source: yoloResult.source,
					inferenceTimeMs: yoloResult.inferenceTimeMs,
					fallbackUsed: yoloResult.fallbackUsed
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Harvest Upload Error:', error);
		
		/** @type {any} */
		const err = error;
		if (err.code === 'NOT_FOUND') {
			return json(
				{
					success: false,
					error: {
						code: 'NOT_FOUND',
						message: 'Farmer tidak ditemukan',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 404 }
			);
		}

		if (err.code === 'NO_TOMATO_DETECTED') {
			return json({
				success: false,
				error: {
					code: 'NO_TOMATO_DETECTED',
					message: 'Tidak ada tomat yang terdeteksi pada gambar. Pastikan gambar jelas.',
					details: []
				},
				requestId: crypto.randomUUID()
			}, { status: 400 });
		}

		if (err.code === 'AI_SERVICE_ERROR' || err.code === 'EXTERNAL_TIMEOUT') {
			return json({
				success: false,
				error: {
					code: err.code,
					message: 'Layanan AI sedang gangguan atau kehabisan waktu.',
					details: []
				},
				requestId: crypto.randomUUID()
			}, { status: 502 });
		}

		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Error internal: ' + (err.message || 'tidak diketahui'),
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: 500 }
		);
	}
}
