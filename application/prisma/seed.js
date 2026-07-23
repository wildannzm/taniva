import { prisma } from '../src/lib/server/db/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
	console.log('Seeding database...');
	
	const defaultPasswordHash = await bcrypt.hash('password', 10);

	// 1. Admin User
	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@taniva.com' },
		update: { passwordHash: defaultPasswordHash },
		create: {
			name: 'Administrator',
			email: 'admin@taniva.com',
			passwordHash: defaultPasswordHash,
			role: 'ADMIN',
		},
	});
	console.log('Created admin user:', adminUser.email);

	// 2. Farmer User
	const farmerUser = await prisma.user.upsert({
		where: { email: 'farmer@taniva.com' },
		update: { passwordHash: defaultPasswordHash },
		create: {
			name: 'Petani',
			email: 'farmer@taniva.com',
			passwordHash: defaultPasswordHash,
			role: 'FARMER',
			farmer: {
				create: {
					farmName: 'Kebun Makmur',
					address: 'Jl. Slamet Riyadi No. 1, Surakarta',
					latitude: -7.5666,
					longitude: 110.8283,
				}
			}
		},
	});
	console.log('Created farmer user:', farmerUser.email);

	// 3. UMKM User
	const umkmUser = await prisma.user.upsert({
		where: { email: 'umkm@taniva.com' },
		update: { passwordHash: defaultPasswordHash },
		create: {
			name: 'UMKM',
			email: 'umkm@taniva.com',
			passwordHash: defaultPasswordHash,
			role: 'UMKM',
			umkm: {
				create: {
					businessName: 'Kripik Jaya',
					address: 'Jl. Jend. Sudirman No. 2, Surakarta',
					latitude: -7.5755,
					longitude: 110.8243,
				}
			}
		},
	});
	console.log('Created UMKM user:', umkmUser.email);
	
	console.log('Seeding complete!');
}

main()
	.catch((e) => {
		console.error('Seed Error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
