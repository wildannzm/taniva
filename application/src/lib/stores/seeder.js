// src/lib/stores/seeder.js
// Seeds localStorage with demo accounts and activity data for all 3 roles

const USERS_KEY = 'taniva_users';
const ACTIVITY_KEY = 'taniva_activity_log';

const SEED_USERS = [
	{ username: 'admin', password: 'admin', role: 'admin' },
	{ username: 'petani1', password: 'petani1', role: 'petani' },
	{ username: 'pakslamet', password: 'pakslamet', role: 'petani' },
	{ username: 'umkm1', password: 'umkm1', role: 'umkm' },
	{ username: 'buwarung', password: 'buwarung', role: 'umkm' }
];

/**
 * Generate a random date within the last N days
 * @param {number} daysBack
 */
function randomDate(daysBack) {
	const d = new Date();
	d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
	d.setHours(Math.floor(Math.random() * 14) + 6); // 6am - 8pm
	d.setMinutes(Math.floor(Math.random() * 60));
	return d.toISOString();
}

/** @returns {string} */
function uuid() {
	return crypto.randomUUID();
}

const SEED_ACTIVITIES = [
	{ role: 'admin', username: 'admin', action: 'Login', detail: 'Admin login ke sistem' },
	{ role: 'petani', username: 'pakslamet', action: 'Upload Panen', detail: 'Mengunggah foto tomat batch BATCH-044, skor kualitas 92' },
	{ role: 'petani', username: 'petani1', action: 'Upload Panen', detail: 'Mengunggah foto tomat batch BATCH-045, skor kualitas 85' },
	{ role: 'umkm', username: 'umkm1', action: 'Buat Permintaan', detail: 'Meminta 50kg tomat Grade A via NLP' },
	{ role: 'umkm', username: 'buwarung', action: 'Scan QR', detail: 'Verifikasi batch BATCH-044, Valid ✓' },
	{ role: 'umkm', username: 'umkm1', action: 'Rating Petani', detail: 'Memberi rating 5/5 untuk Pak Slamet' },
	{ role: 'petani', username: 'pakslamet', action: 'Lihat Reputasi', detail: 'Mengecek skor reputasi: 92.1' },
	{ role: 'umkm', username: 'buwarung', action: 'Buat Permintaan', detail: 'Meminta 100kg tomat Grade B via NLP' },
	{ role: 'petani', username: 'petani1', action: 'Upload Panen', detail: 'Mengunggah foto cabai batch BATCH-046, skor kualitas 78' },
	{ role: 'umkm', username: 'umkm1', action: 'Scan QR', detail: 'Verifikasi batch BATCH-045, Valid ✓' },
	{ role: 'admin', username: 'admin', action: 'Monitoring', detail: 'Mengecek dashboard monitoring sistem' },
	{ role: 'petani', username: 'pakslamet', action: 'Upload Panen', detail: 'Mengunggah foto tomat batch BATCH-047, skor kualitas 95' },
	{ role: 'umkm', username: 'buwarung', action: 'Rating Petani', detail: 'Memberi rating 4/5 untuk Petani1' },
	{ role: 'petani', username: 'petani1', action: 'Lihat Reputasi', detail: 'Mengecek skor reputasi: 80.5' },
	{ role: 'umkm', username: 'umkm1', action: 'Buat Permintaan', detail: 'Meminta 25kg cabai Grade A via NLP' },
	{ role: 'admin', username: 'admin', action: 'Login', detail: 'Admin login ke sistem' },
	{ role: 'petani', username: 'pakslamet', action: 'Upload Panen', detail: 'Mengunggah foto kangkung batch BATCH-048, skor kualitas 88' },
	{ role: 'umkm', username: 'buwarung', action: 'Scan QR', detail: 'Verifikasi batch BATCH-047, Valid ✓' },
];

/**
 * Seed the app with demo users and activity data.
 * Always ensures seed accounts exist, merging with any existing data.
 */
export function seedDatabase() {
	if (typeof localStorage === 'undefined') return;
	
	// Seed users — merge, never skip
	/** @type {any[]} */
	const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
	for (const seed of SEED_USERS) {
		if (!existingUsers.find((/** @type {any} */ u) => u.username === seed.username)) {
			existingUsers.push(seed);
		}
	}
	localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
	
	// Seed activities only if empty
	const existingActivities = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
	if (existingActivities.length === 0) {
		const seeded = SEED_ACTIVITIES.map((a, i) => ({
			id: uuid(),
			...a,
			timestamp: randomDate(7 - Math.floor(i / 3))
		}));
		localStorage.setItem(ACTIVITY_KEY, JSON.stringify(seeded));
	}
}

/**
 * Force reseed - clears and re-creates all data
 */
export function forceReseed() {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(USERS_KEY);
	localStorage.removeItem(ACTIVITY_KEY);
	seedDatabase();
}
