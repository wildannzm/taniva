import { json } from '@sveltejs/kit';
import { extractIntentRequestSchema } from '$lib/schemas/nlp.js';
import { extractIntent } from '$lib/server/services/nlp.service.js';
import { OpenRouterError } from '$lib/server/services/openrouter.service.js';

export async function POST({ request }) {
	try {
		const body = await request.json();

		const validationResult = extractIntentRequestSchema.safeParse(body);
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

		const result = await extractIntent(validationResult.data.text);

		return json({
			success: true,
			data: {
				rawText: result.rawText,
				intent: result.intent,
				requiresConfirmation: result.requiresConfirmation
			},
			meta: result.meta
		});
	} catch (error) {
		if (error instanceof OpenRouterError) {
			return json(
				{
					success: false,
					error: {
						code: error.code,
						message: error.message
					}
				},
				{ status: error.status }
			);
		}

		// Handle unexpected JSON parsing errors from request.json()
		if (error instanceof SyntaxError) {
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

		console.error('Unhandled error in extract-intent endpoint:', error);
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
