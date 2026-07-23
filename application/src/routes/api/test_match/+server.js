import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db/prisma';
import { MatchingService } from '$lib/server/services/matching.service.js';

export async function GET() {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
    if (orders.length === 0) return json({ error: "no orders" });
    const orderId = orders[0].id;
    const results = await MatchingService.search(orderId);
    return json({ orderId, results });
}
