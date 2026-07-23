import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding farmers and harvest batches for matching...');

	// Create dummy UMKM User
	let umkmUser = await prisma.user.findUnique({ where: { email: 'dummy_umkm@test.com' } });
	if (!umkmUser) {
		umkmUser = await prisma.user.create({
			data: {
				email: 'dummy_umkm@test.com',
				passwordHash: await bcrypt.hash('password123', 10),
				role: 'UMKM',
				name: 'Ibu Susi'
			}
		});
	}

	// Create UMKM profile
	let umkm = await prisma.umkm.findFirst();
	if (!umkm) {
		umkm = await prisma.umkm.create({
			data: {
				userId: umkmUser.id,
				businessName: 'Warung Makan Ibu Susi',
				address: 'Jl. Slamet Riyadi No. 1, Solo',
				latitude: -7.5666,
				longitude: 110.8283
			}
		});
		console.log('Created dummy UMKM:', umkm.id);
	}

	// Create Farmers
	const farmersData = [
		{
			farmName: 'Kebun Makmur',
			name: 'Pak Budi',
			email: 'budi@tani.com',
			address: 'Karanganyar',
			latitude: -7.595,
			longitude: 110.945, // approx 15km
			reputationScore: 90
		},
		{
			farmName: 'Sido Muncul Farm',
			name: 'Bu Tejo',
			email: 'tejo@tani.com',
			address: 'Boyolali',
			latitude: -7.533,
			longitude: 110.600, // approx 25km
			reputationScore: 85
		},
		{
			farmName: 'Tani Jaya',
			name: 'Mas Joko',
			email: 'joko@tani.com',
			address: 'Sukoharjo',
			latitude: -7.675,
			longitude: 110.840, // approx 12km
			reputationScore: 75
		}
	];

	for (const data of farmersData) {
		let user = await prisma.user.findUnique({ where: { email: data.email } });
		if (!user) {
			user = await prisma.user.create({
				data: {
					email: data.email,
					passwordHash: await bcrypt.hash('password123', 10),
					role: 'FARMER',
					name: data.name
				}
			});
		}

		let farmer = await prisma.farmer.findFirst({ where: { userId: user.id } });
		if (!farmer) {
			farmer = await prisma.farmer.create({
				data: {
					userId: user.id,
					farmName: data.farmName,
					address: data.address,
					latitude: data.latitude,
					longitude: data.longitude,
					reputationScore: data.reputationScore
				}
			});
		}

		// Create harvest batches
		await prisma.harvestBatch.create({
			data: {
				farmerId: farmer.id,
				commodity: 'tomato',
				quantityKg: Math.floor(Math.random() * 100) + 50, // 50-150kg
				remainingQuantityKg: Math.floor(Math.random() * 100) + 50,
				qualityScore: Math.floor(Math.random() * 30) + 70, // 70-100
				pricePerKg: 10000 + (Math.floor(Math.random() * 5) * 1000), // 10k-14k
				availableDate: new Date(),
				originalImageUrl: 'dummy',
				status: 'AVAILABLE'
			}
		});
		console.log(`Created farmer ${data.name} and tomato harvest batch`);
	}

	console.log('Seeding finished!');
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
