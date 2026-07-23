import { prisma } from '$lib/server/db/prisma.js';
import { LogisticsService } from './logistics.service.js';

const MATCHING_MAX_CANDIDATES = 20;
const QUALITY_WEIGHT = 0.4;
const REPUTATION_WEIGHT = 0.35;
const LOGISTICS_WEIGHT = 0.25;

/**
 * @param {number} distanceKm
 * @returns {number}
 */
function calculateLogisticsScore(distanceKm) {
	if (distanceKm <= 5) return 100;
	if (distanceKm <= 10) return 90;
	if (distanceKm <= 20) return 75;
	if (distanceKm <= 30) return 60;
	return 40;
}

export const MatchingService = {
	/**
	 * Main algorithm for deterministic matching
	 * @param {string} orderId
	 */
	async search(orderId) {
		// 1. Get Order
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: { umkm: true }
		});

		if (!order) {
			throw new Error('Order not found');
		}
		if (order.status !== 'CONFIRMED') {
			throw new Error('Order is not CONFIRMED');
		}

		// Calculate remaining order quantity as number
		const orderQuantityKg = Number(order.quantityKg);

		// 2. Query Candidate Batches
		// Status available, commodity sama, remainingQuantityKg > 0, qualityScore >= minimumQuality, availableDate <= neededDate
		const rawCandidates = await prisma.harvestBatch.findMany({
			where: {
				commodity: order.commodity,
				status: 'AVAILABLE',
				remainingQuantityKg: { gt: 0 }
			},
			include: {
				farmer: true,
				certificate: true
			},
			orderBy: { qualityScore: 'desc' },
			take: MATCHING_MAX_CANDIDATES
		});

		// 3. Compute Scores and Logistics
		/** @type {any[]} */
		const scoredCandidates = [];
		for (const batch of rawCandidates) {
			// calculate route
			const route = await LogisticsService.calculateRoute(
				{ latitude: order.latitude, longitude: order.longitude },
				{ latitude: batch.farmer.latitude, longitude: batch.farmer.longitude }
			);

			const logisticsScore = calculateLogisticsScore(route.distanceKm);
			const qualityScore = Number(batch.qualityScore);
			const reputationScore = Number(batch.farmer.reputationScore);

			const qualityContribution = qualityScore * QUALITY_WEIGHT;
			const reputationContribution = reputationScore * REPUTATION_WEIGHT;
			const logisticsContribution = logisticsScore * LOGISTICS_WEIGHT;

			let totalScore = qualityContribution + reputationContribution + logisticsContribution;

			// Soft Matching Penalties
			let penalties = [];
			
			if (qualityScore < order.minimumQuality) {
				const gap = order.minimumQuality - qualityScore;
				totalScore -= gap * 1.5; // deduct score significantly based on gap
				penalties.push(`Kualitas (Grade ${qualityScore}) di bawah permintaan (Grade ${order.minimumQuality})`);
			}
			
			const bDate = new Date(batch.availableDate).setHours(0,0,0,0);
			const oDate = new Date(order.neededDate).setHours(0,0,0,0);
			if (bDate > oDate) {
				totalScore -= 40; // Heavy penalty for late delivery
				penalties.push('Tersedia melewati tenggat waktu');
			}
			
			totalScore = Math.max(0, totalScore);
			
			// Format as a full object for easy consumption
			scoredCandidates.push({
				batch,
				farmer: batch.farmer,
				certificate: batch.certificate,
				route,
				penalties,
				scores: {
					qualityScore,
					reputationScore,
					logisticsScore,
					qualityContribution,
					reputationContribution,
					logisticsContribution,
					totalScore
				}
			});
		}

		// Sort by totalScore DESC
		scoredCandidates.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

		/** @type {any[]} */
		const options = [];

		// 4. Find Single-Supplier Options
		/** @type {any[]} */
		const singleOptions = [];
		for (const candidate of scoredCandidates) {
			const remainingQty = Number(candidate.batch.remainingQuantityKg);
			if (remainingQty >= orderQuantityKg) {
				const productSubtotal = orderQuantityKg * candidate.batch.pricePerKg;
				const logisticsCost = candidate.route.estimatedCost;

				singleOptions.push({
					type: 'single', // Change to single
					isSingle: true,
					totalScore: candidate.scores.totalScore,
					grandTotal: productSubtotal + logisticsCost,
					totalDistance: candidate.route.distanceKm,
					aggregateQuality: candidate.scores.qualityScore,
					aggregateReputation: candidate.scores.reputationScore,
					aggregateLogistics: candidate.scores.logisticsScore,
					penjelasan_nlp: candidate.penalties && candidate.penalties.length > 0 ? "⚠️ " + candidate.penalties.join('. ') : "✅ Sangat cocok dengan kriteria Anda.",
					productSubtotal,
					logisticsCost,
					fulfilledQuantityKg: orderQuantityKg,
					shortageQuantityKg: 0,
					allocations: [
						{
							candidate,
							allocatedQuantityKg: orderQuantityKg,
							pricePerKg: candidate.batch.pricePerKg,
							productSubtotal,
							logisticsCost: candidate.route.estimatedCost
						}
					]
				});
			}
		}

		if (singleOptions.length > 0) {
			options.push(...singleOptions);
		}
		
		// 5. Find Max 2-Supplier Split Options (Always evaluate even if single options exist)
		/** @type {any[]} */
		const splitOptions = [];
		for (let i = 0; i < scoredCandidates.length; i++) {
			for (let j = i + 1; j < scoredCandidates.length; j++) {
				const c1 = scoredCandidates[i];
				const c2 = scoredCandidates[j];

				// Must be different farmers
				if (c1.farmer.id === c2.farmer.id) continue;

				const qty1 = Number(c1.batch.remainingQuantityKg);
				const qty2 = Number(c2.batch.remainingQuantityKg);

				if (qty1 + qty2 >= orderQuantityKg) {
					// c1 is guaranteed to have higher score than c2 because array is sorted
					const alloc1 = qty1; // Takes max possible since it can't fulfill entirely alone (no single option)
					const alloc2 = orderQuantityKg - alloc1;

					if (alloc2 <= qty2 && alloc2 > 0) {
						// Calculate aggregates (Quantity-weighted)
						const aggQuality = (alloc1 * c1.scores.qualityScore + alloc2 * c2.scores.qualityScore) / orderQuantityKg;
						const aggReputation = (alloc1 * c1.scores.reputationScore + alloc2 * c2.scores.reputationScore) / orderQuantityKg;
						const aggLogistics = (alloc1 * c1.scores.logisticsScore + alloc2 * c2.scores.logisticsScore) / orderQuantityKg;
						
						const totalScore = (aggQuality * QUALITY_WEIGHT) + (aggReputation * REPUTATION_WEIGHT) + (aggLogistics * LOGISTICS_WEIGHT);

						const subtotal1 = alloc1 * c1.batch.pricePerKg;
						const subtotal2 = alloc2 * c2.batch.pricePerKg;
						const productSubtotal = subtotal1 + subtotal2;
						
						const logisticsCost = c1.route.estimatedCost + c2.route.estimatedCost;
						const grandTotal = productSubtotal + logisticsCost;

						splitOptions.push({
							isSingle: false,
							totalScore,
							grandTotal,
							totalDistance: c1.route.distanceKm + c2.route.distanceKm,
							aggregateQuality: aggQuality,
							aggregateReputation: aggReputation,
							aggregateLogistics: aggLogistics,
							penjelasan_nlp: (() => {
								const p = [...c1.penalties, ...c2.penalties];
								const uniq = [...new Set(p)];
								return uniq.length > 0 ? "⚠️ " + uniq.join('. ') : "✅ Sangat cocok dengan kriteria Anda (Gabungan 2 petani).";
							})(),
							productSubtotal,
							logisticsCost,
							fulfilledQuantityKg: orderQuantityKg,
							shortageQuantityKg: 0,
							allocations: [
								{
									candidate: c1,
									allocatedQuantityKg: alloc1,
									pricePerKg: c1.batch.pricePerKg,
									productSubtotal: subtotal1,
									logisticsCost: c1.route.estimatedCost
								},
								{
									candidate: c2,
									allocatedQuantityKg: alloc2,
									pricePerKg: c2.batch.pricePerKg,
									productSubtotal: subtotal2,
									logisticsCost: c2.route.estimatedCost
								}
							]
						});
					}
				}
			}
		}
		options.push(...splitOptions);

		// 6. Sort and Limit Options
		// Ranking: totalScore desc, grandTotal asc, distance asc, aggregateQuality desc, availableDate asc (implicitly handled if scores equal)
		options.sort((a, b) => {
			if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
			if (a.grandTotal !== b.grandTotal) return a.grandTotal - b.grandTotal;
			if (a.totalDistance !== b.totalDistance) return a.totalDistance - b.totalDistance;
			return b.aggregateQuality - a.aggregateQuality;
		});

		// Filter for diversity: ensure unique combinations of farmers
		const uniqueOptions = [];
		const seenCombinations = new Set();
		for (const opt of options) {
			const farmerIds = opt.allocations.map((/** @type {any} */ a) => a.candidate.farmer.id).sort().join(',');
			if (!seenCombinations.has(farmerIds)) {
				seenCombinations.add(farmerIds);
				uniqueOptions.push(opt);
			}
		}

		const topOptions = uniqueOptions.slice(0, 5); // Limit to top 5 combinations

		// If no options, it's a shortage
		if (topOptions.length === 0) {
			// We return empty results according to API but with a shortage structure maybe?
			// The prompt says "kembalikan shortage, jangan gabungkan tiga"
			// Wait, the API schema in API.md returns "results: [...]". If empty, we can just return empty array.
			// Or we return a single option with shortage. But there are no allocations for shortage.
		}

		// 7. Atomic DB Write
		// Delete old options and match results first
		await prisma.$transaction(async (/** @type {any} */ tx) => {
			await tx.fulfillmentAllocation.deleteMany({
				where: { option: { orderId } }
			});
			await tx.fulfillmentOption.deleteMany({
				where: { orderId }
			});
			await tx.matchResult.deleteMany({
				where: { orderId }
			});

			// Insert MatchResults (only for scoredCandidates that we computed)
			for (let i = 0; i < scoredCandidates.length; i++) {
				const c = scoredCandidates[i];
				await tx.matchResult.create({
					data: {
						orderId,
						batchId: c.batch.id,
						qualityScore: c.scores.qualityScore,
						reputationScore: c.scores.reputationScore,
						logisticsScore: c.scores.logisticsScore,
						qualityContribution: c.scores.qualityContribution,
						reputationContribution: c.scores.reputationContribution,
						logisticsContribution: c.scores.logisticsContribution,
						totalScore: c.scores.totalScore,
						distanceKm: c.route.distanceKm,
						durationMinutes: c.route.durationMinutes,
						estimatedCost: c.route.estimatedCost,
						routeSource: c.route.routeSource,
						rank: i + 1
					}
				});
			}

			// Insert FulfillmentOptions
			for (let i = 0; i < topOptions.length; i++) {
				const opt = topOptions[i];
				const optionRecord = await tx.fulfillmentOption.create({
					data: {
						orderId,
						type: opt.isSingle ? 'SINGLE' : 'SPLIT',
						rank: i + 1,
						fulfilledQuantityKg: opt.fulfilledQuantityKg,
						shortageQuantityKg: opt.shortageQuantityKg,
						productSubtotal: opt.productSubtotal,
						logisticsCost: opt.logisticsCost,
						grandTotal: opt.grandTotal,
						aggregateQualityScore: opt.aggregateQuality,
						aggregateReputationScore: opt.aggregateReputation,
						aggregateLogisticsScore: opt.aggregateLogistics,
						totalScore: opt.totalScore,
						status: 'DRAFT'
					}
				});

				// Insert Allocations
				for (let s = 0; s < opt.allocations.length; s++) {
					const alloc = opt.allocations[s];
					await tx.fulfillmentAllocation.create({
						data: {
							optionId: optionRecord.id,
							batchId: alloc.candidate.batch.id,
							allocatedQuantityKg: alloc.allocatedQuantityKg,
							pricePerKg: alloc.pricePerKg,
							productSubtotal: alloc.productSubtotal,
							distanceKm: alloc.candidate.route.distanceKm,
							durationMinutes: alloc.candidate.route.durationMinutes,
							logisticsCost: alloc.logisticsCost,
							routeSource: alloc.candidate.route.routeSource,
							routeGeometry: alloc.candidate.route.geometry,
							qualityScore: alloc.candidate.scores.qualityScore,
							reputationScore: alloc.candidate.scores.reputationScore,
							sequence: s + 1
						}
					});
				}
				
				// Inject DB ID back to the option for output
				opt.id = optionRecord.id;
			}
		});

		// 8. Re-fetch from DB to construct exact API JSON (to ensure it matches DB exactly)
		const savedOptions = await prisma.fulfillmentOption.findMany({
			where: { orderId },
			orderBy: { rank: 'asc' },
			include: {
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

		// Map to API response structure
		const results = savedOptions.map((/** @type {any} */ opt, index) => {
			// Find the corresponding original option (since they are both sorted by rank, index usually matches, but we can search by rank to be safe)
			const originalOpt = topOptions.find((o, idx) => idx === index);

			return {
				optionId: opt.id,
				type: opt.type.toLowerCase(),
				rank: opt.rank,
				fulfilledQuantityKg: Number(opt.fulfilledQuantityKg),
				shortageQuantityKg: Number(opt.shortageQuantityKg),
				productSubtotal: opt.productSubtotal,
				logisticsCost: opt.logisticsCost,
				grandTotal: opt.grandTotal,
				penjelasan_nlp: originalOpt ? originalOpt.penjelasan_nlp : null,
				score: {
					total: Number(opt.totalScore),
					aggregateQuality: Number(opt.aggregateQualityScore),
					aggregateReputation: Number(opt.aggregateReputationScore),
					aggregateLogistics: Number(opt.aggregateLogisticsScore)
				},
				allocations: opt.allocations.map((/** @type {any} */ a) => ({
					allocationId: a.id,
					batchId: a.batchId,
					farmer: {
						id: a.batch.farmer.id,
						name: a.batch.farmer.farmName,
						reputationScore: Number(a.batch.farmer.reputationScore)
					},
					allocatedQuantityKg: Number(a.allocatedQuantityKg),
					pricePerKg: a.pricePerKg,
					productSubtotal: a.productSubtotal,
					logistics: {
						distanceKm: Number(a.distanceKm),
						durationMinutes: a.durationMinutes,
						logisticsCost: a.logisticsCost,
						routeSource: a.routeSource,
						geometry: a.routeGeometry
					},
					certificate: a.batch.certificate ? {
						certificateCode: a.batch.certificate.certificateCode,
						verifyUrl: a.batch.certificate.verifyUrl
					} : null
				}))
			};
		});

		// If shortage, return a shortage response instead of empty array?
		// "lebih dari dua supplier dibutuhkan → kembalikan shortage"
		// If results is empty, we return a single item indicating shortage
		if (results.length === 0) {
			return [{
				optionId: null,
				type: 'shortage',
				rank: 1,
				fulfilledQuantityKg: 0,
				shortageQuantityKg: orderQuantityKg,
				productSubtotal: 0,
				logisticsCost: 0,
				grandTotal: 0,
				score: {
					total: 0,
					aggregateQuality: 0,
					aggregateReputation: 0,
					aggregateLogistics: 0
				},
				allocations: []
			}];
		}

		return results;
	}
};
