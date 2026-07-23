import { json } from '@sveltejs/kit';
import { selectFulfillmentSchema } from '$lib/schemas/order.js';
import { OrderService } from '$lib/server/services/order.service.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const body = await request.json();
		const validation = selectFulfillmentSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid payload',
						details: validation.error.issues
					}
				},
				{ status: 400 }
			);
		}

		const { orderId } = params;
		const { fulfillmentOptionId } = validation.data;

		const result = await OrderService.selectFulfillmentPlan(orderId, fulfillmentOptionId);

		return json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error('Select Fulfillment Error:', error);

		if (error instanceof Error) {
			if (error.message.includes('not found') || error.message.includes('not belong')) {
				return json(
					{
						success: false,
						error: {
							code: 'NOT_FOUND',
							message: error.message
						}
					},
					{ status: 404 }
				);
			}

			if (error.message.includes('CONFLICT') || error.message.includes('Insufficient')) {
				return json(
					{
						success: false,
						error: {
							code: 'CONFLICT',
							message: error.message
						}
					},
					{ status: 409 }
				);
			}

			if (
				error.message.includes('CONFIRMED') ||
				error.message.includes('no longer available') ||
				error.message.includes('does not match order') ||
				error.message.includes('matched with another')
			) {
				return json(
					{
						success: false,
						error: {
							code: 'INVALID_STATE',
							message: error.message
						}
					},
					{ status: 400 }
				);
			}
		}

		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'An unexpected error occurred during fulfillment selection.'
				}
			},
			{ status: 500 }
		);
	}
}
