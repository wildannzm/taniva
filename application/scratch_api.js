import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
    if (orders.length === 0) {
        console.log("No orders found");
        return;
    }
    const orderId = orders[0].id;
    console.log("Found order:", orderId);

    try {
        const response = await fetch('http://localhost:5173/api/matching/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
test();
