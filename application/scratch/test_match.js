import { PrismaClient } from '@prisma/client';
import { MatchingService } from './src/lib/server/services/matching.service.js';

const prisma = new PrismaClient();

async function main() {
    // get the latest order
    const order = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!order) {
        console.log("No orders found");
        return;
    }

    console.log(`Testing matching for order: ${order.id} (${order.commodity} ${order.quantityKg}kg min_qual:${order.minimumQuality})`);

    const results = await MatchingService.search(order.id);
    console.log(`Returned ${results.length} results`);
    results.forEach((r, i) => {
        console.log(`Option ${i+1}: farmers: ${r.allocations.map(a => a.farmer.name).join(', ')} - total score: ${r.score.total}`);
    });
}
main().finally(() => prisma.$disconnect());
