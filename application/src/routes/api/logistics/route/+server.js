import { json } from '@sveltejs/kit';
import { routeRequestSchema } from '$lib/schemas/logistics.js';
import { LogisticsService } from '$lib/server/services/logistics.service.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();

		const validation = routeRequestSchema.safeParse(body);
		if (!validation.success) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid coordinate payload',
						details: validation.error.issues
					}
				},
				{ status: 400 }
			);
		}

		const { origin, destination } = validation.data;

		const routeResult = await LogisticsService.calculateRoute(origin, destination);

		return json(
			{
				success: true,
				data: routeResult
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Logistics Route Error:', error);
		// If JSON parsing fails
		if (error instanceof SyntaxError) {
			return json(
				{
					success: false,
					error: {
						code: 'VALIDATION_ERROR',
						message: 'Invalid JSON body'
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
					message: 'An unexpected error occurred'
				}
			},
			{ status: 500 }
		);
	}
}
