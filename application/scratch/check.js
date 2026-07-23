import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const batches = await prisma.harvestBatch.findMany({ include: { farmer: true } });
    for (const b of batches) {
        console.log(`Farmer: ${b.farmer.farmName} | Qty: ${b.remainingQuantityKg} | Quality: ${b.qualityScore}`);
    }
}
main().finally(() => prisma.$disconnect());
