import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchingService } from '$lib/server/services/matching.service.js';
import { prisma } from '$lib/server/db/prisma.js';
import { LogisticsService } from '$lib/server/services/logistics.service.js';

vi.mock('$lib/server/db/prisma.js', () => ({
	prisma: {
		order: {
			findUnique: vi.fn()
		},
		harvestBatch: {
			findMany: vi.fn()
		},
		fulfillmentOption: {
			findMany: vi.fn()
		},
		$transaction: vi.fn((cb) => {
			const tx = {
				fulfillmentAllocation: { deleteMany: vi.fn(), create: vi.fn() },
				fulfillmentOption: { deleteMany: vi.fn(), create: vi.fn().mockResolvedValue({ id: 'mock-opt-id' }) },
				matchResult: { deleteMany: vi.fn(), create: vi.fn() }
			};
			return cb(tx);
		})
	}
}));

vi.mock('$lib/server/services/logistics.service.js', () => ({
	LogisticsService: {
		calculateRoute: vi.fn()
	}
}));

describe('Matching Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws if order not found', async () => {
		prisma.order.findUnique.mockResolvedValue(null);
		await expect(MatchingService.search('order-1')).rejects.toThrow('Order not found');
	});

	it('throws if order is not CONFIRMED', async () => {
		prisma.order.findUnique.mockResolvedValue({ status: 'DRAFT' });
		await expect(MatchingService.search('order-1')).rejects.toThrow('Order is not CONFIRMED');
	});

	it('finds single option if stock is sufficient', async () => {
		prisma.order.findUnique.mockResolvedValue({
			id: 'order-1',
			status: 'CONFIRMED',
			quantityKg: 20,
			commodity: 'Tomat',
			minimumQuality: 80,
			neededDate: new Date('2026-08-01'),
			latitude: -7.5,
			longitude: 110.5,
			umkm: { id: 'u1' }
		});

		prisma.harvestBatch.findMany.mockResolvedValue([
			{
				id: 'batch-1',
				remainingQuantityKg: 50,
				pricePerKg: 10000,
				qualityScore: 90,
				farmer: { id: 'f1', latitude: -7.51, longitude: 110.51, reputationScore: 85 }
			}
		]);

		LogisticsService.calculateRoute.mockResolvedValue({
			distanceKm: 5,
			estimatedCost: 15000,
			routeSource: 'openrouteservice',
			geometry: { type: 'LineString', coordinates: [] }
		});

		// Mock the post-transaction fetch
		prisma.fulfillmentOption.findMany.mockResolvedValue([
			{
				id: 'opt-1',
				type: 'SINGLE',
				rank: 1,
				fulfilledQuantityKg: 20,
				shortageQuantityKg: 0,
				productSubtotal: 200000,
				logisticsCost: 15000,
				grandTotal: 215000,
				totalScore: 90.75, // (90*0.4) + (85*0.35) + (100*0.25) = 36 + 29.75 + 25 = 90.75
				aggregateQualityScore: 90,
				aggregateReputationScore: 85,
				aggregateLogisticsScore: 100,
				allocations: [
					{
						id: 'alloc-1',
						batchId: 'batch-1',
						batch: { farmer: { id: 'f1', farmName: 'F1', reputationScore: 85 } },
						allocatedQuantityKg: 20,
						pricePerKg: 10000,
						productSubtotal: 200000,
						distanceKm: 5,
						logisticsCost: 15000,
						routeSource: 'openrouteservice'
					}
				]
			}
		]);

		const result = await MatchingService.search('order-1');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('single');
		expect(result[0].fulfilledQuantityKg).toBe(20);
		expect(result[0].allocations).toHaveLength(1);
		
		// Verify atomic transaction was called
		expect(prisma.$transaction).toHaveBeenCalled();
	});

	it('creates split option for 30kg order with 18kg + 12kg batches', async () => {
		prisma.order.findUnique.mockResolvedValue({
			id: 'order-split',
			status: 'CONFIRMED',
			quantityKg: 30,
			commodity: 'Tomat',
			minimumQuality: 80,
			neededDate: new Date('2026-08-01'),
			latitude: -7.5,
			longitude: 110.5,
			umkm: { id: 'u1' }
		});

		// Neither batch has 30kg alone. So no single option.
		prisma.harvestBatch.findMany.mockResolvedValue([
			{
				id: 'batch-18',
				remainingQuantityKg: 18,
				pricePerKg: 10000,
				qualityScore: 90,
				farmer: { id: 'f1', latitude: -7.51, longitude: 110.51, reputationScore: 90 }
			},
			{
				id: 'batch-12',
				remainingQuantityKg: 15, // Has 15 but we only need 12
				pricePerKg: 10000,
				qualityScore: 85,
				farmer: { id: 'f2', latitude: -7.52, longitude: 110.52, reputationScore: 85 }
			}
		]);

		LogisticsService.calculateRoute.mockResolvedValue({
			distanceKm: 5, // 100 logistics score
			estimatedCost: 15000,
			routeSource: 'haversine', // fallback
			geometry: { type: 'LineString', coordinates: [] }
		});

		// Mock post-transaction fetch
		prisma.fulfillmentOption.findMany.mockResolvedValue([
			{
				id: 'opt-split',
				type: 'SPLIT',
				rank: 1,
				fulfilledQuantityKg: 30,
				shortageQuantityKg: 0,
				productSubtotal: 300000,
				logisticsCost: 30000,
				grandTotal: 330000,
				totalScore: 91,
				aggregateQualityScore: 88, // (18*90 + 12*85)/30 = 88
				aggregateReputationScore: 88,
				aggregateLogisticsScore: 100,
				allocations: [
					{
						id: 'alloc-1',
						batchId: 'batch-18',
						batch: { farmer: { id: 'f1', farmName: 'F1', reputationScore: 90 } },
						allocatedQuantityKg: 18,
						pricePerKg: 10000,
						productSubtotal: 180000,
						distanceKm: 5,
						logisticsCost: 15000,
						routeSource: 'haversine'
					},
					{
						id: 'alloc-2',
						batchId: 'batch-12',
						batch: { farmer: { id: 'f2', farmName: 'F2', reputationScore: 85 } },
						allocatedQuantityKg: 12,
						pricePerKg: 10000,
						productSubtotal: 120000,
						distanceKm: 5,
						logisticsCost: 15000,
						routeSource: 'haversine'
					}
				]
			}
		]);

		const result = await MatchingService.search('order-split');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('split');
		expect(result[0].fulfilledQuantityKg).toBe(30);
		expect(result[0].allocations).toHaveLength(2);
		expect(result[0].allocations[0].allocatedQuantityKg).toBe(18);
		expect(result[0].allocations[1].allocatedQuantityKg).toBe(12);
		expect(result[0].allocations[0].logistics.routeSource).toBe('haversine');
	});

	it('returns shortage if stock total is insufficient (more than 2 suppliers needed)', async () => {
		prisma.order.findUnique.mockResolvedValue({
			id: 'order-shortage',
			status: 'CONFIRMED',
			quantityKg: 100,
			commodity: 'Tomat',
			minimumQuality: 80,
			neededDate: new Date('2026-08-01'),
			latitude: -7.5,
			longitude: 110.5,
			umkm: { id: 'u1' }
		});

		// 3 suppliers have 30kg each (total 90kg), none of max 2 combinations can reach 100kg
		prisma.harvestBatch.findMany.mockResolvedValue([
			{
				id: 'b1', remainingQuantityKg: 30, pricePerKg: 10000, qualityScore: 90,
				farmer: { id: 'f1', latitude: -7.51, longitude: 110.51, reputationScore: 90 }
			},
			{
				id: 'b2', remainingQuantityKg: 30, pricePerKg: 10000, qualityScore: 90,
				farmer: { id: 'f2', latitude: -7.51, longitude: 110.51, reputationScore: 90 }
			},
			{
				id: 'b3', remainingQuantityKg: 30, pricePerKg: 10000, qualityScore: 90,
				farmer: { id: 'f3', latitude: -7.51, longitude: 110.51, reputationScore: 90 }
			}
		]);

		LogisticsService.calculateRoute.mockResolvedValue({
			distanceKm: 5, estimatedCost: 15000, routeSource: 'ors', geometry: {}
		});

		prisma.fulfillmentOption.findMany.mockResolvedValue([]); // Nothing inserted

		const result = await MatchingService.search('order-shortage');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('shortage');
		expect(result[0].shortageQuantityKg).toBe(100);
		expect(result[0].allocations).toHaveLength(0);
	});
});
