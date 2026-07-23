import { prisma } from '$lib/prisma.js';
import { fail, redirect } from '@sveltejs/kit';
import { logActivity } from '$lib/stores/activityLog.js';

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			return fail(400, { error: 'Username dan kata sandi wajib diisi' });
		}

		// Find user by email or name (mocking username behavior since our seeder uses name/email)
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: username },
					{ name: username }
				]
			}
		});

		// Check simple mock passwordHash
		if (!user || user.passwordHash !== password) {
			return fail(401, { error: 'Username atau kata sandi salah' });
		}

		cookies.set('session', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		// Role-based redirect
		let targetRole = 'petani';
		if (user.role === 'ADMIN') targetRole = 'admin';
		if (user.role === 'UMKM') targetRole = 'umkm';
		throw redirect(303, `/${targetRole}`);
	},
	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();
		const role = data.get('role')?.toString();

		if (!username || !email || !password || !role) {
			return fail(400, { error: 'Semua kolom wajib diisi' });
		}
		
		const existing = await prisma.user.findFirst({
			where: { OR: [{ email }, { name: username }] }
		});
		if (existing) {
			return fail(400, { error: 'Username atau email sudah digunakan' });
		}
		
		const user = await prisma.user.create({
			data: {
				name: username,
				email: email,
				passwordHash: password,
				role: role
			}
		});
		
		cookies.set('session', user.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7
		});
		
		let targetRole = 'petani';
		if (role === 'ADMIN') targetRole = 'admin';
		if (role === 'UMKM') targetRole = 'umkm';
		throw redirect(303, `/${targetRole}`);
	}
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.user) {
		let targetRole = 'petani';
		if (locals.user.role === 'ADMIN') targetRole = 'admin';
		if (locals.user.role === 'UMKM') targetRole = 'umkm';
		throw redirect(303, `/${targetRole}`);
	}
	return {};
}
