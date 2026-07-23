import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	if (locals.user.role !== 'UMKM' && locals.user.role !== 'ADMIN') {
		const fallbackRoute = locals.user.role === 'FARMER' ? '/petani' : '/admin';
		throw redirect(303, fallbackRoute);
	}
	return {};
};
