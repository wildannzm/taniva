import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    // 1. Fetch problematic Harvest Batches (quality issues)
    const badBatches = await prisma.harvestBatch.findMany({
        where: {
            qualityLabel: {
                in: ['ROTTEN', 'MIXED']
            }
        },
        include: {
            farmer: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch problematic Orders (logistics/cancellation issues)
    const cancelledOrders = await prisma.order.findMany({
        where: {
            status: 'CANCELLED'
        },
        include: {
            umkm: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Compute Metrics
    // Volume Terdampak (Total kg of bad batches)
    let volumeTerdampak = 0;
    for (const batch of badBatches) {
        volumeTerdampak += Number(batch.quantityKg);
    }

    // Risiko Kualitas Buruk (% of rotten batches)
    const totalBatches = await prisma.harvestBatch.count();
    const rottenBatches = badBatches.filter(b => b.qualityLabel === 'ROTTEN').length;
    const risikoKualitas = totalBatches > 0 ? Math.round((rottenBatches / totalBatches) * 100) : 0;

    // Keterlambatan Logistik (Count of cancelled orders)
    const keterlambatanLogistik = cancelledOrders.length;

    // UMKM Terdampak (Count of unique UMKMs with cancelled orders)
    const uniqueUmkmIds = new Set(cancelledOrders.map(o => o.umkmId));
    const umkmTerdampak = uniqueUmkmIds.size;

    const metrics = {
        volumeTerdampak,
        risikoKualitas,
        keterlambatanLogistik,
        umkmTerdampak
    };

    // 4. Build impactData for the Incident Log table
    const incidents = [];

    // Map bad batches to incidents
    for (const batch of badBatches) {
        const priority = batch.qualityLabel === 'ROTTEN' ? 'Tinggi' : 'Sedang';
        incidents.push({
            id: batch.id.substring(0, 13), // short ID for display
            name: `Panen Kualitas Rendah - ${batch.farmer.user.name}`,
            category: batch.commodity,
            status: 'Pending',
            priority,
            time: batch.createdAt.toLocaleDateString('id-ID'),
            dateObj: batch.createdAt
        });
    }

    // Map cancelled orders to incidents
    for (const order of cancelledOrders) {
        incidents.push({
            id: order.id.substring(0, 13),
            name: `Pesanan Dibatalkan - ${order.umkm.user.name}`,
            category: 'Logistik',
            status: 'Pending',
            priority: 'Tinggi',
            time: order.createdAt.toLocaleDateString('id-ID'),
            dateObj: order.createdAt
        });
    }

    // Sort combined incidents by date descending
    incidents.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    
    // Remove dateObj for client delivery
    const impactData = incidents.map(inc => {
        const { dateObj, ...rest } = inc;
        return rest;
    });

    return {
        metrics,
        impactData
    };
}
