import { z } from 'zod';

export const matchingSearchSchema = z
	.object({
		orderId: z.string().uuid()
	})
	.strict();
