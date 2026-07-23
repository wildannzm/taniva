import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
	cookies.delete('taniva_session', { path: '/' });
	throw redirect(303, '/login');
};
