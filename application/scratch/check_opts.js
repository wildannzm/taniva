const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.fulfillmentOption.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 5, 
    include: { allocations: { include: { batch: { include: { farmer: true } } } } } 
}).then(res => console.log(JSON.stringify(res, null, 2)))
.finally(() => prisma.$disconnect());
