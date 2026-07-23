import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';
import { createOrderSchema } from '$lib/schemas/order.js';

/**
 * Decimal serialization helper
 * @param {any} value
 */
function decimalToNumber(value) {
	return value == null ? null : Number(value);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();

		const validationResult = createOrderSchema.safeParse(body);
		if (!validationResult.success) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid request body',
						details: validationResult.error.format()
					}
				},
				{ status: 400 }
			);
		}

		const data = validationResult.data;

		// 1. Idempotency Check
		if (data.idempotencyKey) {
			const existingOrder = await prisma.order.findUnique({
				where: { idempotencyKey: data.idempotencyKey },
				include: {
					umkm: true
				}
			});

			if (existingOrder) {
				// Prevent double submit by returning the existing order as 200 or 409
				// Usually returning 200 OK with the existing resource is good practice for idempotency
				return json(
					{
						success: true,
						data: {
							...existingOrder,
							quantityKg: decimalToNumber(existingOrder.quantityKg),
							minimumQuality: decimalToNumber(existingOrder.minimumQuality),
							neededDate: existingOrder.neededDate.toISOString().split('T')[0]
						},
						meta: { message: 'Returned existing order (idempotent request)' }
					},
					{ status: 200 }
				);
			}
		}

		const umkmProfile = await prisma.umkm.findUnique({
			where: { id: data.umkmId }
		});

		if (!umkmProfile) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'UMKM profile not found'
					}
				},
				{ status: 400 }
			);
		}

		let finalLatitude = umkmProfile.latitude;
		let finalLongitude = umkmProfile.longitude;

		// If the frontend provides new coordinates, use them and save to profile
		if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
			finalLatitude = data.latitude;
			finalLongitude = data.longitude;

			await prisma.umkm.update({
				where: { id: data.umkmId },
				data: {
					latitude: finalLatitude,
					longitude: finalLongitude
				}
			});
		}

		// 3. Create the Order
		const newOrder = await prisma.order.create({
			data: {
				umkmId: data.umkmId,
				rawText: data.rawText,
				commodity: data.commodity,
				quantityKg: data.quantityKg,
				minimumQuality: data.minimumQuality,
				neededDate: new Date(data.neededDate),
				latitude: finalLatitude,
				longitude: finalLongitude,
				nlpSource: data.nlpSource || null,
				idempotencyKey: data.idempotencyKey || null,
				status: 'CONFIRMED' // Business rule: status setelah konfirmasi adalah CONFIRMED
			},
			include: {
				umkm: true
			}
		});

		// 4. Format response safely without exposing raw Prisma object
		const responseData = {
			...newOrder,
			quantityKg: decimalToNumber(newOrder.quantityKg),
			minimumQuality: decimalToNumber(newOrder.minimumQuality),
			neededDate: newOrder.neededDate.toISOString().split('T')[0]
		};

		return json(
			{
				success: true,
				data: responseData
			},
			{ status: 201 }
		);
	} catch (error) {
		/** @type {any} */
		const err = error;

		if (err instanceof SyntaxError) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid JSON payload'
					}
				},
				{ status: 400 }
			);
		}

		// If it's a unique constraint violation from Prisma on idempotency_key
		if (err.code === 'P2002' && err.meta?.target?.includes('idempotency_key')) {
			return json(
				{
					success: false,
					error: {
						code: 'CONFLICT',
						message: 'Order with this idempotency key already exists'
					}
				},
				{ status: 409 }
			);
		}

		console.error('Unhandled error in POST /api/orders:', error);
		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'An unexpected error occurred'
				},
				requestId: crypto.randomUUID()
			},
			{ status: 500 }
		);
	}
}
