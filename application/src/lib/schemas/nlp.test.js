import { describe, it, expect } from 'vitest';
import { extractIntentRequestSchema, intentSchema } from './nlp.js';

// ─── extractIntentRequestSchema ────────────────────────────────────────────────

describe('extractIntentRequestSchema', () => {
	it('accepts valid text', () => {
		const result = extractIntentRequestSchema.safeParse({ text: 'Saya butuh 20 kg tomat' });
		expect(result.success).toBe(true);
		expect(result.data.text).toBe('Saya butuh 20 kg tomat');
	});

	it('trims whitespace', () => {
		const result = extractIntentRequestSchema.safeParse({ text: '   tomat bagus   ' });
		expect(result.success).toBe(true);
		expect(result.data.text).toBe('tomat bagus');
	});

	it('rejects empty text', () => {
		const result = extractIntentRequestSchema.safeParse({ text: '' });
		expect(result.success).toBe(false);
	});

	it('rejects text shorter than 3 characters', () => {
		const result = extractIntentRequestSchema.safeParse({ text: 'ab' });
		expect(result.success).toBe(false);
	});

	it('rejects text longer than 1000 characters', () => {
		const result = extractIntentRequestSchema.safeParse({ text: 'a'.repeat(1001) });
		expect(result.success).toBe(false);
	});

	it('rejects missing text field', () => {
		const result = extractIntentRequestSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects non-string text', () => {
		const result = extractIntentRequestSchema.safeParse({ text: 123 });
		expect(result.success).toBe(false);
	});
});

// ─── intentSchema ──────────────────────────────────────────────────────────────

describe('intentSchema', () => {
	const validIntent = {
		status: 'complete',
		intent: {
			commodity: 'tomato',
			quantityKg: 20,
			minimumQuality: 80,
			neededDate: '2026-07-24'
		},
		missingFields: [],
		clarificationQuestion: null
	};

	it('accepts valid intent', () => {
		const result = intentSchema.safeParse(validIntent);
		expect(result.success).toBe(true);
		expect(result.data).toEqual(validIntent);
	});

	it('rejects commodity other than tomato', () => {
		const result = intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, commodity: 'potato' } });
		expect(result.success).toBe(false);
	});

	it('rejects quantity <= 0', () => {
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, quantityKg: 0 } }).success).toBe(false);
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, quantityKg: -5 } }).success).toBe(false);
	});

	it('rejects NaN quantity', () => {
		const result = intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, quantityKg: NaN } });
		expect(result.success).toBe(false);
	});

	it('rejects Infinity quantity', () => {
		const result = intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, quantityKg: Infinity } });
		expect(result.success).toBe(false);
	});

	it('rejects minimumQuality below 0', () => {
		const result = intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, minimumQuality: -1 } });
		expect(result.success).toBe(false);
	});

	it('rejects minimumQuality above 100', () => {
		const result = intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, minimumQuality: 101 } });
		expect(result.success).toBe(false);
	});

	it('accepts minimumQuality at boundaries', () => {
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, minimumQuality: 0 } }).success).toBe(true);
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, minimumQuality: 100 } }).success).toBe(true);
	});

	it('rejects date with wrong format', () => {
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, neededDate: '24-07-2026' } }).success).toBe(
			false
		);
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, neededDate: '2026/07/24' } }).success).toBe(
			false
		);
	});

	it('rejects invalid date (e.g. Feb 30)', () => {
		expect(intentSchema.safeParse({ ...validIntent, intent: { ...validIntent.intent, neededDate: '2026-02-30' } }).success).toBe(
			false
		);
	});

	it('rejects additional properties (strict mode)', () => {
		const result = intentSchema.safeParse({ ...validIntent, extraField: 'oops' });
		expect(result.success).toBe(false);
	});

	it('rejects missing required fields', () => {
		const rest = { ...validIntent, intent: { ...validIntent.intent } };
		delete rest.intent.commodity;
		expect(intentSchema.safeParse(rest).success).toBe(false);
	});
});
