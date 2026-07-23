import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '$lib/server/services/order.service.js';
import { prisma } from '$lib/server/db/prisma.js';

vi.mock('$lib/server/db/prisma.js', () => ({
	prisma: {
		order: {
			findUnique: vi.fn(),
			update: vi.fn()
		},
		fulfillmentOption: {
			findUnique: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn()
		},
		harvestBatch: {
			update: vi.fn()
		},
		$transaction: vi.fn((cb) => {
			const tx = {
				harvestBatch: { update: vi.fn() },
				fulfillmentOption: { update: vi.fn(), updateMany: vi.fn() },
				order: { update: vi.fn() }
			};
			return cb(tx);
		})
	}
}));

describe('Order Service - selectFulfillmentPlan', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws if order not found', async () => {
		prisma.order.findUnique.mockResolvedValue(null);
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Order not found');
	});

	it('throws if order is not CONFIRMED', async () => {
		prisma.order.findUnique.mockResolvedValue({ status: 'DRAFT' });
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Order must be in CONFIRMED state');
	});

	it('returns idempotently if already matched with same option', async () => {
		prisma.order.findUnique.mockResolvedValue({
			status: 'MATCHED',
			selectedFulfillmentOptionId: 'opt-1'
		});
		
		prisma.fulfillmentOption.findUnique.mockResolvedValue({
			id: 'opt-1',
			type: 'SINGLE',
			order: { status: 'MATCHED' },
			allocations: []
		});

		const result = await OrderService.selectFulfillmentPlan('order-1', 'opt-1');
		expect(result.optionId).toBe('opt-1');
		expect(prisma.$transaction).not.toHaveBeenCalled();
	});

	it('throws if already matched with different option', async () => {
		prisma.order.findUnique.mockResolvedValue({
			status: 'MATCHED',
			selectedFulfillmentOptionId: 'opt-2'
		});
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Order is already matched with another option');
	});

	it('throws if option not found or does not belong to order', async () => {
		prisma.order.findUnique.mockResolvedValue({ status: 'CONFIRMED' });
		prisma.fulfillmentOption.findUnique.mockResolvedValue(null);
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Fulfillment option not found');
		
		prisma.fulfillmentOption.findUnique.mockResolvedValue({ orderId: 'other-order' });
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Fulfillment option does not belong to this order');
	});

	it('throws if option is EXPIRED', async () => {
		prisma.order.findUnique.mockResolvedValue({ status: 'CONFIRMED' });
		prisma.fulfillmentOption.findUnique.mockResolvedValue({ orderId: 'order-1', status: 'EXPIRED' });
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Fulfillment option is no longer available');
	});

	it('throws if quantity mismatch or insufficient stock', async () => {
		prisma.order.findUnique.mockResolvedValue({ status: 'CONFIRMED', quantityKg: 10 });
		
		// Quantity mismatch
		prisma.fulfillmentOption.findUnique.mockResolvedValue({
			orderId: 'order-1',
			status: 'DRAFT',
			fulfilledQuantityKg: 9,
			allocations: []
		});
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Fulfillment quantity does not match order quantity');

		// Insufficient stock in one batch
		prisma.fulfillmentOption.findUnique.mockResolvedValue({
			orderId: 'order-1',
			status: 'DRAFT',
			fulfilledQuantityKg: 10,
			allocations: [
				{
					allocatedQuantityKg: 10,
					batch: { status: 'AVAILABLE', remainingQuantityKg: 5 } // only 5 left
				}
			]
		});
		await expect(OrderService.selectFulfillmentPlan('order-1', 'opt-1')).rejects.toThrow('Insufficient stock in one of the batches');
	});

	it('successfully reserves single option', async () => {
		prisma.order.findUnique.mockResolvedValue({ id: 'o1', status: 'CONFIRMED', quantityKg: 10 });
		prisma.fulfillmentOption.findUnique
			.mockResolvedValueOnce({
				id: 'opt-1',
				orderId: 'o1',
				status: 'DRAFT',
				fulfilledQuantityKg: 10,
				allocations: [
					{
						allocatedQuantityKg: 10,
						batch: { id: 'b1', status: 'AVAILABLE', remainingQuantityKg: 15 }
					}
				]
			})
			.mockResolvedValueOnce({ // mock for getFulfillmentDetails
				id: 'opt-1',
				type: 'SINGLE',
				order: { status: 'MATCHED' },
				allocations: [
					{
						id: 'a1',
						batchId: 'b1',
						batch: { 
							remainingQuantityKg: 5,
							farmer: { id: 'f1', farmName: 'Farm 1' }
						},
						allocatedQuantityKg: 10,
						logistics: { distanceKm: 5 }
					}
				]
			});

		// We must mock the tx behavior to return updated batch
		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				harvestBatch: { 
					update: vi.fn().mockResolvedValue({ remainingQuantityKg: 5 }) 
				},
				fulfillmentOption: { update: vi.fn(), updateMany: vi.fn() },
				order: { update: vi.fn() }
			};
			await cb(tx);
			expect(tx.harvestBatch.update).toHaveBeenCalledWith({
				where: { id: 'b1', remainingQuantityKg: { gte: 10 } },
				data: { remainingQuantityKg: { decrement: 10 } }
			});
			expect(tx.order.update).toHaveBeenCalledWith({
				where: { id: 'o1' },
				data: { status: 'MATCHED', selectedFulfillmentOptionId: 'opt-1' }
			});
			expect(tx.fulfillmentOption.updateMany).toHaveBeenCalledWith({
				where: { orderId: 'o1', id: { not: 'opt-1' } },
				data: { status: 'EXPIRED' }
			});
		});

		const result = await OrderService.selectFulfillmentPlan('o1', 'opt-1');
		expect(result.optionId).toBe('opt-1');
	});

	it('throws CONFLICT when atomic update fails (concurrency)', async () => {
		prisma.order.findUnique.mockResolvedValue({ id: 'o1', status: 'CONFIRMED', quantityKg: 10 });
		prisma.fulfillmentOption.findUnique.mockResolvedValue({
			id: 'opt-1', orderId: 'o1', status: 'DRAFT', fulfilledQuantityKg: 10,
			allocations: [{ allocatedQuantityKg: 10, batch: { id: 'b1', status: 'AVAILABLE', remainingQuantityKg: 15 } }]
		});

		prisma.$transaction.mockImplementationOnce(async (cb) => {
			const tx = {
				harvestBatch: { 
					update: vi.fn().mockRejectedValue({ code: 'P2025' }) // Prisma RecordNotFound
				}
			};
			await cb(tx);
		});

		await expect(OrderService.selectFulfillmentPlan('o1', 'opt-1'))
			.rejects.toThrow('CONFLICT: Insufficient stock during atomic reservation');
	});
});
