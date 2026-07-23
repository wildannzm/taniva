import { PrismaClient } from '../src/generated/prisma/index.js';
import 'dotenv/config';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Fixed IDs for Idempotency
const UMKM_1_ID = "10000000-0000-0000-0000-000000000001";
const UMKM_2_ID = "10000000-0000-0000-0000-000000000002";

const FARMER_A_ID = "20000000-0000-0000-0000-000000000001";
const FARMER_B_ID = "20000000-0000-0000-0000-000000000002";
const FARMER_C_ID = "20000000-0000-0000-0000-000000000003";

const BATCH_SINGLE_ID = "30000000-0000-0000-0000-000000000001";
const BATCH_SPLIT_1_ID = "30000000-0000-0000-0000-000000000002";
const BATCH_SPLIT_2_ID = "30000000-0000-0000-0000-000000000003";
const BATCH_ROTTEN_ID = "30000000-0000-0000-0000-000000000004";

const CERT_SINGLE_ID = "40000000-0000-0000-0000-000000000001";
const CERT_SPLIT_1_ID = "40000000-0000-0000-0000-000000000002";
const CERT_SPLIT_2_ID = "40000000-0000-0000-0000-000000000003";

function generateHash(batchId) {
	return crypto.createHash('sha256').update(batchId + 'SECRET_SALT').digest('hex');
}

async function main() {
	console.log('Clearing database for idempotency...');
	await prisma.rating.deleteMany();
	await prisma.fulfillmentAllocation.deleteMany();
	await prisma.fulfillmentOption.deleteMany();
	await prisma.order.deleteMany();
	await prisma.certificate.deleteMany();
	await prisma.harvestBatch.deleteMany();
	await prisma.umkm.deleteMany();
	await prisma.farmer.deleteMany();
	await prisma.user.deleteMany();

	console.log('Seeding Users...');
	await prisma.user.createMany({
		data: [
			{ id: UMKM_1_ID, name: 'Budi Santoso', role: 'UMKM' },
			{ id: UMKM_2_ID, name: 'Siti Rahma', role: 'UMKM' },
			{ id: FARMER_A_ID, name: 'Asep', role: 'FARMER' },
			{ id: FARMER_B_ID, name: 'Jajang', role: 'FARMER' },
			{ id: FARMER_C_ID, name: 'Tatang', role: 'FARMER' }
		]
	});

	console.log('Seeding UMKMs...');
	await prisma.umkm.createMany({
		data: [
			{
				id: UMKM_1_ID,
				userId: UMKM_1_ID,
				businessName: "UMKM Sejahtera Bandung",
				address: "Jl. Braga No. 1, Bandung",
				latitude: -6.9175,
				longitude: 107.6191
			},
			{
				id: UMKM_2_ID,
				userId: UMKM_2_ID,
				businessName: "UMKM Sayur Lembang",
				address: "Jl. Raya Lembang No. 100, Kab. Bandung Barat",
				latitude: -6.8142,
				longitude: 107.6186
			}
		]
	});

	console.log('Seeding Farmers...');
	await prisma.farmer.createMany({
		data: [
			{
				id: FARMER_A_ID,
				userId: FARMER_A_ID,
				farmName: "Kebun Mang Asep",
				address: "Cibodas, Lembang",
				latitude: -6.8000,
				longitude: 107.6000,
				reputationScore: 85.0,
				ratingCount: 15
			},
			{
				id: FARMER_B_ID,
				userId: FARMER_B_ID,
				farmName: "Tani Jaya Jajang",
				address: "Cikole, Lembang",
				latitude: -6.7800,
				longitude: 107.6200,
				reputationScore: 92.5,
				ratingCount: 10
			},
			{
				id: FARMER_C_ID,
				userId: FARMER_C_ID,
				farmName: "Tatang Sayur",
				address: "Parongpong, Kab. Bandung Barat",
				latitude: -6.7950,
				longitude: 107.5700,
				reputationScore: 78.0,
				ratingCount: 22
			}
		]
	});

	console.log('Seeding Harvest Batches...');
	// Batch for Single Match (Need 20kg, has 25kg)
	await prisma.harvestBatch.create({
		data: {
			id: BATCH_SINGLE_ID,
			farmerId: FARMER_A_ID,
			commodity: "Tomat",
			quantityKg: 25.0,
			remainingQuantityKg: 25.0,
			pricePerKg: 12000,
			availableDate: new Date(),
			qualityScore: 88.5,
			qualityLabel: "FRESH",
			originalImageUrl: "https://example.com/tomat-fresh.jpg",
			status: "AVAILABLE",
			certificate: {
				create: {
					id: CERT_SINGLE_ID,
					certificateCode: "CERT-A-001",
					hashSha256: generateHash(BATCH_SINGLE_ID),
					verifyUrl: `https://taniva.app/verify/${BATCH_SINGLE_ID}`,
					snapshotJson: "{}",
					qrImageUrl: "https://example.com/qr-a.png"
				}
			}
		}
	});

	// Batch for Split Match (Need 30kg. Farmer B has 18kg, Farmer C has 12kg)
	await prisma.harvestBatch.create({
		data: {
			id: BATCH_SPLIT_1_ID,
			farmerId: FARMER_B_ID,
			commodity: "Tomat",
			quantityKg: 18.0,
			remainingQuantityKg: 18.0,
			pricePerKg: 11000,
			availableDate: new Date(),
			qualityScore: 82.0,
			qualityLabel: "FRESH",
			originalImageUrl: "https://example.com/tomat-b.jpg",
			status: "AVAILABLE",
			certificate: {
				create: {
					id: CERT_SPLIT_1_ID,
					certificateCode: "CERT-B-001",
					hashSha256: generateHash(BATCH_SPLIT_1_ID),
					verifyUrl: `https://taniva.app/verify/${BATCH_SPLIT_1_ID}`,
					snapshotJson: "{}",
					qrImageUrl: "https://example.com/qr-b.png"
				}
			}
		}
	});

	await prisma.harvestBatch.create({
		data: {
			id: BATCH_SPLIT_2_ID,
			farmerId: FARMER_C_ID,
			commodity: "Tomat",
			quantityKg: 12.0,
			remainingQuantityKg: 12.0,
			pricePerKg: 13000,
			availableDate: new Date(),
			qualityScore: 91.0,
			qualityLabel: "FRESH",
			originalImageUrl: "https://example.com/tomat-c.jpg",
			status: "AVAILABLE",
			certificate: {
				create: {
					id: CERT_SPLIT_2_ID,
					certificateCode: "CERT-C-001",
					hashSha256: generateHash(BATCH_SPLIT_2_ID),
					verifyUrl: `https://taniva.app/verify/${BATCH_SPLIT_2_ID}`,
					snapshotJson: "{}",
					qrImageUrl: "https://example.com/qr-c.png"
				}
			}
		}
	});

	// Rotten batch to simulate mismatch/shortage
	await prisma.harvestBatch.create({
		data: {
			id: BATCH_ROTTEN_ID,
			farmerId: FARMER_A_ID,
			commodity: "Tomat",
			quantityKg: 15.0,
			remainingQuantityKg: 15.0,
			pricePerKg: 8000,
			availableDate: new Date(),
			qualityScore: 40.0,
			qualityLabel: "ROTTEN",
			originalImageUrl: "https://example.com/tomat-rotten.jpg",
			status: "AVAILABLE"
		}
	});

	console.log('Seed completed successfully!');
	console.log(`
--- Test Data Generated ---
Single Scenario (Tomat 20kg): Use BATCH_SINGLE_ID (${BATCH_SINGLE_ID}) -> Farmer A
Split Scenario (Tomat 30kg): Requires BATCH_SPLIT_1_ID (${BATCH_SPLIT_1_ID}) & BATCH_SPLIT_2_ID (${BATCH_SPLIT_2_ID})
Rotten Scenario: BATCH_ROTTEN_ID (${BATCH_ROTTEN_ID}) is available but quality mismatch.
`);
}

main()
	.catch((e) => {
		console.error('Seed Error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
