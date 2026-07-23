import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/prisma.js';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	if (locals.user.role !== 'FARMER' && locals.user.role !== 'ADMIN') {
		const fallbackRoute = locals.user.role === 'UMKM' ? '/umkm' : '/admin';
		throw redirect(303, fallbackRoute);
	}
	
	let farmerId = null;
	if (locals.user.role === 'FARMER') {
		const farmer = await prisma.farmer.findUnique({
			where: { userId: locals.user.id },
			select: { id: true }
		});
		if (farmer) farmerId = farmer.id;
	}

	return {
		farmerId
	};
};
