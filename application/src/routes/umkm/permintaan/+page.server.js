import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const user = locals.user;
	if (user && user.role === 'UMKM') {
		const umkm = await prisma.umkm.findUnique({
			where: { userId: user.id },
			select: { id: true, latitude: true, longitude: true }
		});
		return {
			umkmId: umkm?.id || null,
			latitude: umkm?.latitude || null,
			longitude: umkm?.longitude || null
		};
	}
	return { umkmId: null, latitude: null, longitude: null };
}
