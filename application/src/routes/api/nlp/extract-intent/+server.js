import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { extractIntentRequestSchema } from '$lib/schemas/nlp.js';
import { extractIntent } from '$lib/server/services/nlp.service.js';
import { OpenRouterError } from '$lib/server/services/openrouter.service.js';

/** @type {import('./$types').RequestHandler} */
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

		if (result.status === 'complete') {
			return json({
				success: true,
				data: {
					rawText: validationResult.data.text,
					status: 'complete',
					intent: result.intent,
					missingFields: [],
					clarificationQuestion: null,
					requiresConfirmation: true
				},
				meta: result.meta
			});
		} else {
			return json({
				success: true,
				data: {
					rawText: validationResult.data.text,
					status: 'needs_clarification',
					partialIntent: result.partialIntent || {
						commodity: 'tomato',
						quantityKg: null,
						minimumQuality: null,
						neededDate: null
					},
					missingFields: result.missingFields || [],
					clarificationQuestion: result.clarificationQuestion || 'Mohon lengkapi pesanan Anda.',
					requiresConfirmation: false
				},
				meta: result.meta
			});
		}
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
