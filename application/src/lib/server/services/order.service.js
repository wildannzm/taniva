import { prisma } from '$lib/server/db/prisma.js';

export const OrderService = {
	/**
	 * Select a fulfillment option and reserve stock atomically
	 * @param {string} orderId
	 * @param {string} optionId
	 */
	async selectFulfillmentPlan(orderId, optionId) {
		// 1. Validasi awal
		const order = await prisma.order.findUnique({
			where: { id: orderId }
		});

		if (!order) {
			throw new Error('Order not found');
		}

		if (order.status === 'MATCHED') {
			if (order.selectedFulfillmentOptionId === optionId) {
				// Idempotent retry: already matched with this exact option
				return this.getFulfillmentDetails(optionId);
			} else {
				throw new Error('Order is already matched with another option');
			}
		}

		if (order.status !== 'CONFIRMED') {
			throw new Error('Order must be in CONFIRMED state');
		}

		const option = await prisma.fulfillmentOption.findUnique({
			where: { id: optionId },
			include: {
				allocations: {
					include: {
						batch: {
							include: {
								farmer: true,
								certificate: true
							}
						}
					}
				}
			}
		});

		if (!option) {
			throw new Error('Fulfillment option not found');
		}

		if (option.orderId !== orderId) {
			throw new Error('Fulfillment option does not belong to this order');
		}

		if (option.status === 'EXPIRED' || option.status === 'SELECTED') {
			throw new Error('Fulfillment option is no longer available');
		}

		// Validate quantities and rules before transaction
		const orderQuantity = Number(order.quantityKg);
		const fulfilledQty = Number(option.fulfilledQuantityKg);

		if (fulfilledQty !== orderQuantity) {
			throw new Error('Fulfillment quantity does not match order quantity');
		}

		for (const alloc of option.allocations) {
			if (alloc.batch.status !== 'AVAILABLE') {
				throw new Error('One of the batches is no longer available');
			}
			if (Number(alloc.batch.remainingQuantityKg) < Number(alloc.allocatedQuantityKg)) {
				throw new Error('Insufficient stock in one of the batches');
			}
		}

		// 2. Transaksi Atomic
		try {
			await prisma.$transaction(async (/** @type {any} */ tx) => {
				for (const alloc of option.allocations) {
					const allocQty = Number(alloc.allocatedQuantityKg);

					// Conditional update to decrement stock safely
					const updatedBatch = await tx.harvestBatch.update({
						where: {
							id: alloc.batch.id,
							remainingQuantityKg: { gte: allocQty }
						},
						data: {
							remainingQuantityKg: { decrement: allocQty }
						}
					});

					// Update batch status if stock becomes 0
					if (Number(updatedBatch.remainingQuantityKg) === 0) {
						await tx.harvestBatch.update({
							where: { id: alloc.batch.id },
							data: { status: 'SOLD_OUT' }
						});
					}
				}

				// Mark option as selected
				await tx.fulfillmentOption.update({
					where: { id: optionId },
					data: { status: 'SELECTED' }
				});

				// Mark order as matched
				await tx.order.update({
					where: { id: orderId },
					data: {
						status: 'MATCHED',
						selectedFulfillmentOptionId: optionId
					}
				});

				// Expire other options for this order
				await tx.fulfillmentOption.updateMany({
					where: {
						orderId: orderId,
						id: { not: optionId }
					},
					data: { status: 'EXPIRED' }
				});
			});
		} catch (error) {
			if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
				throw new Error('CONFLICT: Insufficient stock during atomic reservation');
			}
			throw error;
		}

		return this.getFulfillmentDetails(optionId);
	},

	/**
	 * Construct standardized response
	 * @param {string} optionId
	 */
	async getFulfillmentDetails(optionId) {
		const savedOption = await prisma.fulfillmentOption.findUnique({
			where: { id: optionId },
			include: {
				order: true,
				allocations: {
					include: {
						batch: {
							include: { farmer: true, certificate: true }
						}
					},
					orderBy: { sequence: 'asc' }
				}
			}
		});

		if (!savedOption) throw new Error('Option not found');

		return {
			optionId: savedOption.id,
			type: savedOption.type.toLowerCase(),
			orderStatus: savedOption.order.status,
			fulfilledQuantityKg: Number(savedOption.fulfilledQuantityKg),
			shortageQuantityKg: Number(savedOption.shortageQuantityKg),
			productSubtotal: savedOption.productSubtotal,
			logisticsCost: savedOption.logisticsCost,
			grandTotal: savedOption.grandTotal,
			allocations: savedOption.allocations.map((/** @type {any} */ a) => ({
				allocationId: a.id,
				batchId: a.batchId,
				farmer: {
					id: a.batch.farmer.id,
					name: a.batch.farmer.farmName
				},
				allocatedQuantityKg: Number(a.allocatedQuantityKg),
				remainingQuantityKg: Number(a.batch.remainingQuantityKg),
				pricePerKg: a.pricePerKg,
				productSubtotal: a.productSubtotal,
				logistics: {
					distanceKm: Number(a.distanceKm),
					logisticsCost: a.logisticsCost,
					routeSource: a.routeSource
				},
				certificate: a.batch.certificate
					? {
							certificateCode: a.batch.certificate.certificateCode,
							verifyUrl: a.batch.certificate.verifyUrl
						}
					: null
			}))
		};
	}
};
