import { z } from 'zod';

export const extractIntentRequestSchema = z.object({
	text: z.string().trim().min(3).max(1000)
});

export const intentSchema = z
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
	.strict();
