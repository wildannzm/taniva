import { verifyToken } from '$lib/server/jwt.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const token = event.cookies.get('taniva_session');
	
	if (token) {
		const user = verifyToken(token);
		if (user) {
			event.locals.user = user;
		}
	}

	const url = new URL(event.request.url);
	
	// Protected routes
	if (url.pathname.startsWith('/petani') || url.pathname.startsWith('/umkm')) {
		if (!event.locals.user) {
			throw redirect(303, '/login');
		}

		// Role-based protection (optional, but good practice)
		if (url.pathname.startsWith('/petani') && event.locals.user.role !== 'FARMER' && event.locals.user.role !== 'ADMIN') {
			throw redirect(303, `/${event.locals.user.role.toLowerCase() === 'farmer' ? 'petani' : 'umkm'}`);
		}
		
		if (url.pathname.startsWith('/umkm') && event.locals.user.role !== 'UMKM' && event.locals.user.role !== 'ADMIN') {
			throw redirect(303, `/${event.locals.user.role.toLowerCase() === 'farmer' ? 'petani' : 'umkm'}`);
		}
	}

	return await resolve(event);
}
