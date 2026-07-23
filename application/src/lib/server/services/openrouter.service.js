import { getConfig } from '../config.js';

export class OpenRouterError extends Error {
	/** @param {string} message @param {string} code @param {number} status */
	constructor(message, code, status) {
		super(message);
		this.name = 'OpenRouterError';
		this.code = code;
		this.status = status;
	}
}

/**
 * @param {string} text
 * @param {string} currentDate
 * @returns {Promise<string>}
 */
export async function fetchIntentFromOpenRouter(text, currentDate) {
	const config = getConfig();
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), config.NLP_TIMEOUT_MS);

	try {
		const systemPrompt = `Anda adalah extractor intent pembelian tomat untuk Taniva.
Kembalikan hanya data yang sesuai JSON Schema.
MVP hanya mendukung commodity "tomato". Jika komoditas lain diminta, set status "needs_clarification" dan tanya ulang.
Jangan membuat informasi yang tidak disebutkan atau tidak dapat diturunkan secara aman.
Jika informasi lengkap (commodity, quantityKg, minimumQuality, neededDate), set status "complete" dan isi object "intent".
Jika ada informasi yang kurang, set status "needs_clarification", isi object "partialIntent" dengan data yang ada, sebutkan field yang kurang di "missingFields", dan beri pertanyaan dalam "clarificationQuestion".
quantityKg harus dalam kilogram. Gram dan ton boleh dinormalisasi ke kilogram.
minimumQuality berada pada skala 0–100.
Gunakan tanggal bisnis Asia/Jakarta.
Gunakan currentDate yang diberikan untuk memahami "hari ini", "besok", dan tanggal relatif.
Jangan memberi penjelasan, markdown, atau code fence.

currentDate: ${currentDate}

Mapping kualitas MVP yang boleh digunakan hanya ketika kata kualitas memang muncul:
bagus / segar / tinggi  -> 80
sedang / campur         -> 50
rendah / tidak mensyaratkan kualitas -> 0`;

		const response = await fetch(`${config.OPENROUTER_BASE_URL}/chat/completions`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': config.PUBLIC_APP_URL,
				'X-OpenRouter-Title': config.OPENROUTER_APP_NAME
			},
			body: JSON.stringify({
				model: config.OPENROUTER_MODEL,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: text }
				],
				temperature: 0,
				max_tokens: 500,
				stream: false,
				response_format: {
					type: 'json_schema',
					json_schema: {
						name: 'taniva_purchase_intent',
						strict: true,
						schema: {
							type: 'object',
							additionalProperties: false,
							properties: {
								status: {
									type: 'string',
									enum: ['complete', 'needs_clarification']
								},
								intent: {
									type: ['object', 'null'],
									additionalProperties: false,
									properties: {
										commodity: { type: 'string', enum: ['tomato'] },
										quantityKg: { type: 'number', exclusiveMinimum: 0 },
										minimumQuality: { type: 'number', minimum: 0, maximum: 100 },
										neededDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
									},
									required: ['commodity', 'quantityKg', 'minimumQuality', 'neededDate']
								},
								partialIntent: {
									type: ['object', 'null'],
									additionalProperties: false,
									properties: {
										commodity: { type: ['string', 'null'], enum: ['tomato'] },
										quantityKg: { type: ['number', 'null'], exclusiveMinimum: 0 },
										minimumQuality: { type: ['number', 'null'], minimum: 0, maximum: 100 },
										neededDate: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$' }
									},
									required: ['commodity', 'quantityKg', 'minimumQuality', 'neededDate']
								},
								missingFields: {
									type: 'array',
									items: { type: 'string' }
								},
								clarificationQuestion: {
									type: ['string', 'null']
								}
							},
							required: ['status', 'intent', 'partialIntent', 'missingFields', 'clarificationQuestion']
						}
					}
				},
				provider: {
					require_parameters: true
				}
			}),
			signal: controller.signal
		});

		if (!response.ok) {
			let errorCode = 'NLP_SERVICE_ERROR';
			if (response.status === 401 || response.status === 403) errorCode = 'NLP_SERVICE_ERROR';
			else if (response.status === 429) errorCode = 'NLP_SERVICE_ERROR';
			else if (response.status >= 500) errorCode = 'NLP_SERVICE_ERROR';

			throw new OpenRouterError(
				`OpenRouter API error: ${response.status}`,
				errorCode,
				response.status
			);
		}

		const data = await response.json();

		if (
			!data.choices ||
			!Array.isArray(data.choices) ||
			data.choices.length === 0 ||
			!data.choices[0].message ||
			!data.choices[0].message.content
		) {
			throw new OpenRouterError(
				'Invalid response structure from OpenRouter',
				'NLP_SERVICE_ERROR',
				502
			);
		}

		return data.choices[0].message.content;
	} catch (/** @type {any} */ error) {
		if (error.name === 'AbortError') {
			throw new OpenRouterError('Request to OpenRouter timed out', 'EXTERNAL_TIMEOUT', 504);
		}
		if (error instanceof OpenRouterError) {
			throw error;
		}
		throw new OpenRouterError(`Unexpected error: ${error.message}`, 'INTERNAL_ERROR', 500);
	} finally {
		clearTimeout(timeoutId);
	}
}
