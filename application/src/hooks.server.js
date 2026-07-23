import { verifyToken } from '$lib/server/jwt.js';
import { redirect, json } from '@sveltejs/kit';

const ROUTE_CONFIG = [
	// Frontend Routes
	{ path: '/admin', roles: ['ADMIN'] },
	{ path: '/petani', roles: ['FARMER', 'ADMIN'] },
	{ path: '/umkm', roles: ['UMKM', 'ADMIN'] },
	
	// Backend API Routes
	{ path: '/api/harvest', roles: ['FARMER', 'UMKM', 'ADMIN'] },
	{ path: '/api/matching', roles: ['UMKM', 'ADMIN'] },
	{ path: '/api/nlp', roles: ['UMKM', 'ADMIN'] },
	{ path: '/api/logistics', roles: ['UMKM', 'ADMIN'] },
	{ path: '/api/orders', roles: ['FARMER', 'UMKM', 'ADMIN'] },
	{ path: '/api/feedback', roles: ['UMKM', 'ADMIN'] },
	{ path: '/api/farmer', roles: ['UMKM', 'ADMIN'] }
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get('taniva_session');
	
	if (token) {
		const user = verifyToken(token);
		if (user && typeof user === 'object' && 'role' in user) {
			event.locals.user = /** @type {{ role: string, [key: string]: any }} */ (user);
		}
	}

	const url = new URL(event.request.url);
	const pathname = url.pathname;

	// Cek apakah route saat ini butuh role spesifik berdasarkan config
	const matchedConfig = ROUTE_CONFIG.find(config => pathname.startsWith(config.path));

	if (matchedConfig) {
		const isApiRoute = pathname.startsWith('/api');

		// Jika belum login
		if (!event.locals.user) {
			if (isApiRoute) {
				return json({ success: false, error: 'Unauthorized access. Please login first.' }, { status: 401 });
			} else {
				throw redirect(303, '/login');
			}
		}

		// Jika sudah login tapi role tidak memiliki akses
		if (!matchedConfig.roles.includes(event.locals.user.role)) {
			if (isApiRoute) {
				// Akses API ditolak
				return json({ success: false, error: 'Forbidden: Insufficient privileges.' }, { status: 403 });
			} else {
				// Akses halaman UI ditolak, kembalikan ke dashboard asalnya
				const fallbackRoute = event.locals.user.role === 'FARMER' ? '/petani' : (event.locals.user.role === 'UMKM' ? '/umkm' : '/admin');
				throw redirect(303, fallbackRoute);
			}
		}
	}

	return await resolve(event);
}
