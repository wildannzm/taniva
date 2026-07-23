import { z } from 'zod';

export const extractIntentRequestSchema = z.object({
	text: z.string().trim().min(3).max(1000)
});

export const intentSchema = z
	.object({
		status: z.enum(['complete', 'needs_clarification']),
		intent: z
			.object({
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
						{ message: 'Invalid date' }
					)
			})
			.nullable()
			.optional(),
		partialIntent: z
			.object({
				commodity: z.literal('tomato').nullable().optional(),
				quantityKg: z.number().finite().positive().nullable().optional(),
				minimumQuality: z.number().min(0).max(100).nullable().optional(),
				neededDate: z
					.string()
					.regex(/^\d{4}-\d{2}-\d{2}$/)
					.nullable()
					.optional()
			})
			.nullable()
			.optional(),
		missingFields: z.array(z.string()),
		clarificationQuestion: z.string().nullable()
	})
	.strict();
