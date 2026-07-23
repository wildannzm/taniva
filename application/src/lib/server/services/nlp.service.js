import { fetchIntentFromOpenRouter, OpenRouterError } from './openrouter.service.js';
import { intentSchema } from '../../schemas/nlp.js';
import { getConfig } from '../config.js';

/**
 * @param {string} text
 */
export async function extractIntent(text) {
	const startTime = Date.now();
	const config = getConfig();

	// Create current date in Asia/Jakarta timezone
	const currentDate = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Jakarta',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(new Date());

	try {
		const rawContent = await fetchIntentFromOpenRouter(text, currentDate);

		let parsedJson;
		try {
			// Basic cleanup just in case there are code fences, though structured output shouldn't have them
			const cleanedContent = rawContent
				.replace(/^```json\s*/, '')
				.replace(/\s*```$/, '')
				.trim();
			parsedJson = JSON.parse(cleanedContent);
		} catch {
			throw new OpenRouterError(
				'Failed to parse OpenRouter response as JSON',
				'NLP_SERVICE_ERROR',
				502
			);
		}

		const validationResult = intentSchema.safeParse(parsedJson);

		if (!validationResult.success) {
			throw new OpenRouterError(
				'Parsed JSON does not match intent schema',
				'NLP_SERVICE_ERROR',
				502
			);
		}

		const durationMs = Date.now() - startTime;

		return {
			rawText: text,
			status: validationResult.data.status,
			intent: validationResult.data.intent || null,
			partialIntent: validationResult.data.partialIntent || null,
			missingFields: validationResult.data.missingFields,
			clarificationQuestion: validationResult.data.clarificationQuestion,
			meta: {
				source: 'openrouter-gemma-4',
				model: config.OPENROUTER_MODEL,
				fallbackUsed: false,
				durationMs
			}
		};
	} catch (error) {
		if (error instanceof OpenRouterError) {
			throw error;
		}
		throw new OpenRouterError(
			`Unexpected error in NLP service: ${/** @type {any} */ (error).message}`,
			'INTERNAL_ERROR',
			500
		);
	}
}
