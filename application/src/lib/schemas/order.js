import { z } from 'zod';

export const createOrderSchema = z
	.object({
		umkmId: z.string().uuid(),
		rawText: z.string().min(1).max(2000),
		commodity: z.literal('tomato'),
		quantityKg: z.number().finite().positive(),
		minimumQuality: z.number().min(0).max(100),
		neededDate: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.refine(
				(date) => {
					const d = new Date(date);
					return !isNaN(d.getTime()) && d.toISOString().startsWith(date);
				},
				{ message: 'Invalid neededDate' }
			),
		latitude: z.number().finite().optional(),
		longitude: z.number().finite().optional(),
		nlpSource: z.enum(['openrouter-gemma-4', 'ollama-qwen', 'fallback-parser', 'manual']).optional(),
		confirmed: z.literal(true, {
			message: 'Order must be confirmed by UMKM before saving.'
		}),
		idempotencyKey: z.string().max(255).optional()
	})
	.strict();

export const selectFulfillmentSchema = z
	.object({
		fulfillmentOptionId: z.string().uuid()
	})
	.strict();
