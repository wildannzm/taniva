import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server.js';
import { prisma } from '$lib/server/db/prisma.js';
import crypto from 'crypto';

// Mock prisma client
vi.mock('$lib/server/db/prisma.js', () => ({
	prisma: {
		$transaction: vi.fn(async (cb) => {
			const tx = {
				fulfillmentAllocation: {
					findUnique: vi.fn(),
					findMany: vi.fn(),
					update: vi.fn()
				},
				rating: {
					create: vi.fn().mockResolvedValue({ id: 'rating-1' })
				},
				farmer: {
					update: vi.fn()
				},
				order: {
					update: vi.fn()
				}
			};
			return await cb(tx);
		})
	}
}));

describe('Feedback Rating API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function createMockRequest(body) {
		return {
			request: {
				json: vi.fn().mockResolvedValue(body)
			}
		};
	}

	it('should return 400 if fields are missing', async () => {
		const res = await POST(createMockRequest({ orderId: '1' }));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error.code).toBe('VALIDATION_ERROR');
	});

	it('should throw NOT_FOUND_ALLOCATION if allocation does not exist', async () => {
		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = { fulfillmentAllocation: { findUnique: vi.fn().mockResolvedValue(null) } };
			return await cb(tx);
		});

		const res = await POST(createMockRequest({
			orderId: 'o1', fulfillmentAllocationId: 'a1', umkmId: 'u1', score: 5
		}));
		expect(res.status).toBe(404);
	});

	it('should throw FORBIDDEN_UMKM if wrong UMKM rates', async () => {
		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				fulfillmentAllocation: {
					findUnique: vi.fn().mockResolvedValue({
						option: { orderId: 'o1', order: { umkmId: 'other-u' } }
					})
				}
			};
			return await cb(tx);
		});

		const res = await POST(createMockRequest({
			orderId: 'o1', fulfillmentAllocationId: 'a1', umkmId: 'u1', score: 5
		}));
		expect(res.status).toBe(403);
	});

	it('should throw ALREADY_RATED if duplicate rating', async () => {
		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				fulfillmentAllocation: {
					findUnique: vi.fn().mockResolvedValue({
						option: { orderId: 'o1', order: { umkmId: 'u1' } },
						rating: { id: 'existing-rating' }
					})
				}
			};
			return await cb(tx);
		});

		const res = await POST(createMockRequest({
			orderId: 'o1', fulfillmentAllocationId: 'a1', umkmId: 'u1', score: 5
		}));
		expect(res.status).toBe(409);
	});

	it('successfully rates single supplier and completes order', async () => {
		let updatedFarmer = null;
		let updatedOrder = null;

		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				fulfillmentAllocation: {
					findUnique: vi.fn().mockResolvedValue({
						id: 'a1',
						optionId: 'opt1',
						option: { orderId: 'o1', order: { umkmId: 'u1', selectedFulfillmentOptionId: 'opt1' } },
						batch: { farmer: { id: 'f1', reputationScore: 80, ratingCount: 1 } },
						rating: null
					}),
					update: vi.fn(),
					findMany: vi.fn().mockResolvedValue([
						{ id: 'a1', status: 'COMPLETED' } // Single allocation
					])
				},
				rating: { create: vi.fn().mockResolvedValue({ id: 'r1' }) },
				farmer: {
					update: vi.fn().mockImplementation((args) => { updatedFarmer = args.data; })
				},
				order: {
					update: vi.fn().mockImplementation((args) => { updatedOrder = args.data; })
				}
			};
			return await cb(tx);
		});

		const res = await POST(createMockRequest({
			orderId: 'o1', fulfillmentAllocationId: 'a1', umkmId: 'u1', score: 5
		}));
		expect(res.status).toBe(200);

		// Formula: oldRep=80, count=1, score=5 (100). newRep = (80*1 + 100) / 2 = 90
		expect(updatedFarmer.reputationScore).toBe(90);
		expect(updatedFarmer.ratingCount).toBe(2);
		expect(updatedOrder.status).toBe('COMPLETED');
	});

	it('updates allocation to COMPLETED but order remains if other allocation pending (split case)', async () => {
		let updatedOrder = null;

		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				fulfillmentAllocation: {
					findUnique: vi.fn().mockResolvedValue({
						id: 'a1',
						optionId: 'opt1',
						option: { orderId: 'o1', order: { umkmId: 'u1', selectedFulfillmentOptionId: 'opt1' } },
						batch: { farmer: { id: 'f1', reputationScore: 80, ratingCount: 0 } },
						rating: null
					}),
					update: vi.fn(),
					findMany: vi.fn().mockResolvedValue([
						{ id: 'a1', status: 'COMPLETED' },
						{ id: 'a2', status: 'PENDING' } // Other allocation not done yet
					])
				},
				rating: { create: vi.fn().mockResolvedValue({ id: 'r1' }) },
				farmer: { update: vi.fn() },
				order: {
					update: vi.fn().mockImplementation((args) => { updatedOrder = args.data; })
				}
			};
			return await cb(tx);
		});

		const res = await POST(createMockRequest({
			orderId: 'o1', fulfillmentAllocationId: 'a1', umkmId: 'u1', score: 4
		}));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.data.orderCompleted).toBe(false);
		expect(updatedOrder).toBeNull(); // Order status not updated
	});
});
