import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/db/prisma', () => {
	return {
		default: {
			order: {
				findUnique: vi.fn(),
				create: vi.fn()
			},
			umkm: {
				findUnique: vi.fn(),
				update: vi.fn()
			}
		}
	};
});

import { prisma } from '$lib/server/db/prisma';
import { POST } from './+server.js';
import { GET } from './[orderId]/+server.js';

describe('Orders API', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('POST /api/orders', () => {
		it('returns 400 if confirmed is false', async () => {
			const req = new Request('http://localhost/api/orders', {
				method: 'POST',
				body: JSON.stringify({
					umkmId: '123e4567-e89b-12d3-a456-426614174000',
					rawText: 'Test order',
					commodity: 'tomato',
					quantityKg: 10,
					minimumQuality: 80,
					neededDate: '2026-07-25',
					confirmed: false
				})
			});

			const response = await POST({ request: req });
			const json = await response.json();

			expect(response.status).toBe(400);
			expect(json.success).toBe(false);
			expect(json.error.code).toBe('VALIDATION_ERROR');
		});

		it('creates an order and updates coords if UMKM exists and coords provided', async () => {
			const umkmId = '123e4567-e89b-12d3-a456-426614174000';
			const date = '2026-07-25';

			// Mock UMKM profile
			prisma.umkm.findUnique.mockResolvedValue({
				id: umkmId,
				latitude: 0,
				longitude: 0
			});

			// Mock Order creation
			prisma.order.create.mockResolvedValue({
				id: 'order-1',
				umkmId,
				rawText: 'Test order',
				commodity: 'tomato',
				quantityKg: 10,
				minimumQuality: 80,
				neededDate: new Date(date),
				latitude: -7.5666,
				longitude: 110.8167,
				status: 'CONFIRMED'
			});

			const req = new Request('http://localhost/api/orders', {
				method: 'POST',
				body: JSON.stringify({
					umkmId,
					rawText: 'Test order',
					commodity: 'tomato',
					quantityKg: 10,
					minimumQuality: 80,
					neededDate: date,
					latitude: -7.5666,
					longitude: 110.8167,
					confirmed: true
				})
			});

			const response = await POST({ request: req });
			const json = await response.json();

			expect(response.status).toBe(201);
			expect(json.success).toBe(true);
			
			expect(prisma.umkm.findUnique).toHaveBeenCalledWith({ where: { id: umkmId } });
			expect(prisma.umkm.update).toHaveBeenCalledWith({
				where: { id: umkmId },
				data: { latitude: -7.5666, longitude: 110.8167 }
			});
			expect(prisma.order.create).toHaveBeenCalled();
			
			const createCall = prisma.order.create.mock.calls[0][0];
			expect(createCall.data.latitude).toBe(-7.5666);
			expect(createCall.data.longitude).toBe(110.8167);
		});

		it('handles idempotency key and returns existing order', async () => {
			const idempotencyKey = 'unique-key';
			const umkmId = '123e4567-e89b-12d3-a456-426614174000';
			const date = '2026-07-25';
			
			prisma.order.findUnique.mockResolvedValue({
				id: 'existing-order',
				umkmId,
				quantityKg: 10,
				minimumQuality: 80,
				neededDate: new Date(date),
				idempotencyKey
			});

			const req = new Request('http://localhost/api/orders', {
				method: 'POST',
				body: JSON.stringify({
					umkmId,
					rawText: 'Test order',
					commodity: 'tomato',
					quantityKg: 10,
					minimumQuality: 80,
					neededDate: date,
					latitude: 0,
					longitude: 0,
					confirmed: true,
					idempotencyKey
				})
			});

			const response = await POST({ request: req });
			const json = await response.json();

			expect(response.status).toBe(200);
			expect(json.success).toBe(true);
			expect(json.data.id).toBe('existing-order');
			expect(prisma.order.create).not.toHaveBeenCalled();
		});
		
		it('returns 409 if prisma throws unique constraint violation', async () => {
			const idempotencyKey = 'unique-key';
			const umkmId = '123e4567-e89b-12d3-a456-426614174000';
			
			prisma.order.findUnique.mockResolvedValue(null);
			prisma.umkm.findUnique.mockResolvedValue({
				id: umkmId,
				latitude: 0,
				longitude: 0
			});

			
			const prismaError = new Error('Unique constraint failed');
			prismaError.code = 'P2002';
			prismaError.meta = { target: 'orders_idempotency_key_key' };
			
			prisma.order.create.mockRejectedValue(prismaError);

			const req = new Request('http://localhost/api/orders', {
				method: 'POST',
				body: JSON.stringify({
					umkmId,
					rawText: 'Test order',
					commodity: 'tomato',
					quantityKg: 10,
					minimumQuality: 80,
					neededDate: '2026-07-25',
					latitude: 0,
					longitude: 0,
					confirmed: true,
					idempotencyKey
				})
			});

			const response = await POST({ request: req });
			const json = await response.json();

			expect(response.status).toBe(409);
			expect(json.success).toBe(false);
			expect(json.error.code).toBe('CONFLICT');
		});
	});

	describe('GET /api/orders/[orderId]', () => {
		it('returns 404 if order not found', async () => {
			prisma.order.findUnique.mockResolvedValue(null);

			const response = await GET({ params: { orderId: 'not-found' } });
			const json = await response.json();

			expect(response.status).toBe(404);
			expect(json.success).toBe(false);
			expect(json.error.code).toBe('NOT_FOUND');
		});

		it('returns 200 with formatted order data', async () => {
			const date = '2026-07-25';
			prisma.order.findUnique.mockResolvedValue({
				id: 'order-1',
				quantityKg: 10.5,
				minimumQuality: 80.0,
				neededDate: new Date(date)
			});

			const response = await GET({ params: { orderId: 'order-1' } });
			const json = await response.json();

			expect(response.status).toBe(200);
			expect(json.success).toBe(true);
			expect(json.data.quantityKg).toBe(10.5);
			expect(json.data.minimumQuality).toBe(80);
			expect(json.data.neededDate).toBe(date);
		});
	});
});
