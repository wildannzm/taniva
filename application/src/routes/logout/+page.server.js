import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, locals }) {
	cookies.delete('session', { path: '/' });
	locals.user = undefined;
	throw redirect(303, '/');
}
