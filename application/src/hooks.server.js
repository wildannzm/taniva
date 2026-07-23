import { prisma } from '$lib/prisma.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const user = await prisma.user.findUnique({
			where: { id: sessionId },
			select: { id: true, name: true, email: true, role: true }
		});
		
		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	// RBAC Guard
	const pathname = event.url.pathname;
	
	let targetRole = 'petani';
	if (event.locals.user?.role === 'ADMIN') targetRole = 'admin';
	if (event.locals.user?.role === 'UMKM') targetRole = 'umkm';
	
	if (pathname.startsWith('/admin')) {
		if (!event.locals.user) throw redirect(303, '/login');
		if (event.locals.user.role !== 'ADMIN') throw redirect(303, `/${targetRole}`);
	}
	
	if (pathname.startsWith('/petani')) {
		if (!event.locals.user) throw redirect(303, '/login');
		if (event.locals.user.role !== 'FARMER') throw redirect(303, `/${targetRole}`);
	}
	
	if (pathname.startsWith('/umkm')) {
		if (!event.locals.user) throw redirect(303, '/login');
		if (event.locals.user.role !== 'UMKM') throw redirect(303, `/${targetRole}`);
	}

	const response = await resolve(event);
	return response;
}
