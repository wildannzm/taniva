import { MatchingService } from './src/lib/server/services/matching.service.js';
import { prisma } from './src/lib/server/db/prisma.js';

async function run() {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
    if (orders.length === 0) {
        console.log("No orders found");
        return;
    }
    const orderId = orders[0].id;
    console.log("Running matching for order:", orderId);
    
    try {
        const results = await MatchingService.search(orderId);
        console.log("Results count:", results.length);
        if (results.length > 0) {
            console.log(JSON.stringify(results[0], null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}
run();
