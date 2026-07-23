import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';

/**
 * @param {{ request: Request }} requestEvent
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { orderId, fulfillmentAllocationId, umkmId, score, comment } = body;

		if (!orderId || !fulfillmentAllocationId || !umkmId || score === undefined) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Semua field wajib diisi.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 400 }
			);
		}

		if (score < 1 || score > 5) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Score harus antara 1 sampai 5.',
						details: []
					},
					requestId: crypto.randomUUID()
				},
				{ status: 400 }
			);
		}

		// Mulai transaksi database (Atomic)
		const result = await prisma.$transaction(async (/** @type {any} */ tx) => {
			// 1. Validasi alokasi dan pastikan milik orderId dan umkmId yang tepat
			const allocation = await tx.fulfillmentAllocation.findUnique({
				where: { id: fulfillmentAllocationId },
				include: {
					option: {
						include: {
							order: true
						}
					},
					batch: {
						include: {
							farmer: true
						}
					},
					rating: true
				}
			});

			if (!allocation) {
				throw new Error('NOT_FOUND_ALLOCATION');
			}

			if (allocation.option.orderId !== orderId) {
				throw new Error('INVALID_ORDER_ALLOCATION');
			}

			if (allocation.option.order.umkmId !== umkmId) {
				throw new Error('FORBIDDEN_UMKM');
			}

			// 2. Pastikan belum dirating (satu allocation hanya boleh dirating sekali)
			if (allocation.rating) {
				throw new Error('ALREADY_RATED');
			}
			
			// Validasi bahwa allocation tersebut terpilih di Order
			if (allocation.option.order.selectedFulfillmentOptionId !== allocation.optionId) {
				throw new Error('NOT_SELECTED_OPTION');
			}

			// 3. Kalkulasi Formula Reputasi
			const farmer = allocation.batch.farmer;
			const oldReputation = Number(farmer.reputationScore);
			const oldRatingCount = farmer.ratingCount;

			const ratingScore = score * 20;
			const newReputation = ((oldReputation * oldRatingCount) + ratingScore) / (oldRatingCount + 1);

			// 4. Insert Rating
			const newRating = await tx.rating.create({
				data: {
					allocationId: allocation.id,
					farmerId: farmer.id,
					umkmId: umkmId,
					score: score,
					comment: comment || null,
					oldReputationScore: oldReputation,
					newReputationScore: newReputation
				}
			});

			// 5. Update Farmer Reputation
			await tx.farmer.update({
				where: { id: farmer.id },
				data: {
					reputationScore: newReputation,
					ratingCount: oldRatingCount + 1
				}
			});

			// 6. Update status allocation (Karena kita baru tambahkan field status = PENDING)
			await tx.fulfillmentAllocation.update({
				where: { id: allocation.id },
				data: { status: 'COMPLETED' }
			});

			// 7. Cek apakah seluruh alokasi untuk opsi ini sudah COMPLETED
			const allAllocations = await tx.fulfillmentAllocation.findMany({
				where: { optionId: allocation.optionId }
			});

			const allCompleted = allAllocations.every((/** @type {any} */ a) => 
				a.id === allocation.id ? true : a.status === 'COMPLETED'
			);

			if (allCompleted) {
				await tx.order.update({
					where: { id: orderId },
					data: { status: 'COMPLETED' }
				});
			}

			return {
				ratingId: newRating.id,
				farmerId: farmer.id,
				oldReputation,
				newReputation,
				orderCompleted: allCompleted
			};
		});

		return json({
			success: true,
			data: result
		});

	} catch (/** @type {any} */ error) {
		console.error('Feedback Rating Error:', error);
		
		let statusCode = 500;
		let code = 'INTERNAL_ERROR';
		let message = 'Terjadi kesalahan saat memproses rating';

		if (error.message === 'NOT_FOUND_ALLOCATION') {
			statusCode = 404;
			code = 'NOT_FOUND';
			message = 'Alokasi tidak ditemukan.';
		} else if (error.message === 'INVALID_ORDER_ALLOCATION') {
			statusCode = 400;
			code = 'VALIDATION_ERROR';
			message = 'Alokasi ini tidak termasuk dalam order tersebut.';
		} else if (error.message === 'FORBIDDEN_UMKM') {
			statusCode = 403;
			code = 'FORBIDDEN';
			message = 'UMKM tidak berhak memberikan rating pada order ini.';
		} else if (error.message === 'ALREADY_RATED') {
			statusCode = 409;
			code = 'CONFLICT';
			message = 'Alokasi ini sudah pernah diberikan rating.';
		} else if (error.message === 'NOT_SELECTED_OPTION') {
			statusCode = 400;
			code = 'VALIDATION_ERROR';
			message = 'Hanya alokasi dari opsi pengiriman yang dipilih yang dapat diberi rating.';
		}

		return json(
			{
				success: false,
				error: {
					code,
					message,
					details: []
				},
				requestId: crypto.randomUUID()
			},
			{ status: statusCode }
		);
	}
}
