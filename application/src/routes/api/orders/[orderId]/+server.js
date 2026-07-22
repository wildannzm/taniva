import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { prisma } from '$lib/server/db/prisma';

/**
 * Decimal serialization helper
 * @param {any} value
 */
function decimalToNumber(value) {
	return value == null ? null : Number(value);
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const { orderId } = params;

	try {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				umkm: true,
				fulfillmentOptions: true,
				matchResults: true
			}
		});

		if (!order) {
			return json(
				{
					success: false,
					error: {
						code: 'NOT_FOUND',
						message: `Order with ID ${orderId} not found`
					}
				},
				{ status: 404 }
			);
		}

		// Clean up response representation
		const responseData = {
			...order,
			quantityKg: decimalToNumber(order.quantityKg),
			minimumQuality: decimalToNumber(order.minimumQuality),
			neededDate: order.neededDate.toISOString().split('T')[0]
		};

		// If fulfillmentOptions exist, clean their decimals too
		if (responseData.fulfillmentOptions) {
			responseData.fulfillmentOptions = responseData.fulfillmentOptions.map(/** @param {any} opt */ (opt) => ({
				...opt,
				fulfilledQuantityKg: decimalToNumber(opt.fulfilledQuantityKg),
				shortageQuantityKg: decimalToNumber(opt.shortageQuantityKg),
				aggregateQualityScore: decimalToNumber(opt.aggregateQualityScore),
				aggregateReputationScore: decimalToNumber(opt.aggregateReputationScore),
				aggregateLogisticsScore: decimalToNumber(opt.aggregateLogisticsScore),
				totalScore: decimalToNumber(opt.totalScore)
			}));
		}

		return json(
			{
				success: true,
				data: responseData
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error(`Error in GET /api/orders/${orderId}:`, error);
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
