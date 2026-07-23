import { json } from '@sveltejs/kit';
import { matchingSearchSchema } from '$lib/schemas/matching.js';
import { MatchingService } from '$lib/server/services/matching.service.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();

		const validation = matchingSearchSchema.safeParse(body);
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

		const { orderId } = validation.data;

		const results = await MatchingService.search(orderId);

		return json({
			success: true,
			data: {
				orderId,
				results
			}
		});
	} catch (error) {
		console.error('Matching Search Error:', error);

		if (error instanceof Error && error.message.includes('not found')) {
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

		if (error instanceof Error && error.message.includes('CONFIRMED')) {
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

		return json(
			{
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'An unexpected error occurred during matching search.'
				}
			},
			{ status: 500 }
		);
	}
}
