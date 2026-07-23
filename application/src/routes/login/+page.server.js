import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/prisma.js';
import bcrypt from 'bcryptjs';
import { signToken } from '$lib/server/jwt.js';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ locals }) => {
	if (locals.user) {
		const redirectUrl = locals.user.role === 'FARMER' ? '/petani' : (locals.user.role === 'UMKM' ? '/umkm' : (locals.user.role === 'ADMIN' ? '/admin' : '/'));
		throw redirect(303, redirectUrl);
	}
	return {};
};

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email || !password) {
			return fail(400, { email, error: 'Email dan password harus diisi.' });
		}

		const user = await prisma.user.findUnique({
			where: { email: email.toString() }
		});

		if (!user || !user.passwordHash) {
			return fail(401, { email, error: 'Email atau kata sandi salah.' });
		}

		const valid = await bcrypt.compare(password.toString(), user.passwordHash);
		if (!valid) {
			return fail(401, { email, error: 'Email atau kata sandi salah.' });
		}

		// Generate JWT
		const token = signToken({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role
		});

		// Set Cookie
		cookies.set('taniva_session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		// Redirect based on role
		const redirectUrl = user.role === 'FARMER' ? '/petani' : (user.role === 'UMKM' ? '/umkm' : (user.role === 'ADMIN' ? '/admin' : '/'));
		throw redirect(303, redirectUrl);
	},

	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');
		const role = data.get('role'); // 'petani' or 'umkm'

		if (!name || !email || !password || !role) {
			return fail(400, { name, email, role, error: 'Semua field harus diisi.' });
		}

		const existingUser = await prisma.user.findUnique({
			where: { email: email.toString() }
		});

		if (existingUser) {
			return fail(400, { name, email, role, error: 'Email sudah terdaftar.' });
		}

		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password.toString(), salt);

		const userRole = role === 'petani' ? 'FARMER' : 'UMKM';

		try {
			const newUser = await prisma.user.create({
				data: {
					name: name.toString(),
					email: email.toString(),
					passwordHash,
					role: userRole,
					...(userRole === 'FARMER' ? {
						farmer: {
							create: {
								farmName: `Kebun ${name.toString()}`,
								address: 'Indonesia',
								latitude: 0,
								longitude: 0
							}
						}
					} : {}),
					...(userRole === 'UMKM' ? {
						umkm: {
							create: {
								businessName: `Usaha ${name.toString()}`,
								address: 'Indonesia',
								latitude: 0,
								longitude: 0
							}
						}
					} : {})
				}
			});

			const token = signToken({
				id: newUser.id,
				email: newUser.email,
				name: newUser.name,
				role: newUser.role
			});

			cookies.set('taniva_session', token, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7
			});

		} catch (e) {
			console.error('Register error:', e);
			return fail(500, { name, email, role, error: 'Terjadi kesalahan saat pendaftaran.' });
		}

		const redirectUrl = role === 'petani' ? '/petani' : '/umkm';
		throw redirect(303, redirectUrl);
	},
    
    logout: async ({ cookies }) => {
        cookies.delete('taniva_session', { path: '/' });
        throw redirect(303, '/login');
    }
};
