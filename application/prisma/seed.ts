import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Clean up existing data
	await prisma.activityLog.deleteMany();
	await prisma.user.deleteMany();

	// 1. Create Users (Admin, Farmer, UMKM)
	const admin = await prisma.user.create({
		data: {
			name: 'Administrator',
			email: 'admin@taniva.id',
			passwordHash: 'admin', // Simple for demo
			role: 'ADMIN',
		}
	});

	const petani1 = await prisma.user.create({
		data: {
			name: 'Budi Santoso',
			email: 'petani1@taniva.id',
			passwordHash: 'petani1',
			role: 'FARMER',
			farmer: {
				create: {
					farmName: 'Kebun Berkah',
					address: 'Jl. Merdeka No.1, Solo',
					latitude: -7.5666,
					longitude: 110.8283,
					reputationScore: 85
				}
			}
		}
	});

	const umkm1 = await prisma.user.create({
		data: {
			name: 'Siti Rahma',
			email: 'umkm1@taniva.id',
			passwordHash: 'umkm1',
			role: 'UMKM',
			umkm: {
				create: {
					businessName: 'Sambal Bu Siti',
					address: 'Jl. Slamet Riyadi, Solo',
					latitude: -7.5750,
					longitude: 110.8250
				}
			}
		}
	});

	// 2. Create Initial Activity Logs
	await prisma.activityLog.createMany({
		data: [
			{ userId: admin.id, action: 'Sistem diinisialisasi', details: { module: 'System' } },
			{ userId: petani1.id, action: 'Registrasi Petani baru', details: { farmName: 'Kebun Berkah' } },
			{ userId: umkm1.id, action: 'Registrasi UMKM baru', details: { businessName: 'Sambal Bu Siti' } },
			{ userId: petani1.id, action: 'Upload panen tomat', details: { quantity: 50 } },
			{ userId: umkm1.id, action: 'Membuat permintaan tomat', details: { quantity: 30 } }
		]
	});

	console.log('Database seeded successfully!');
	console.log(`Created users: admin (${admin.id}), petani1 (${petani1.id}), umkm1 (${umkm1.id})`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
