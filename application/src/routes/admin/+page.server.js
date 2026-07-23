import { prisma } from '$lib/server/db/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    // 1. Total users
    const totalUsers = await prisma.user.count();

    // 2. Role distribution
    const roleGroup = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            role: true
        }
    });
    
    // Map DB roles to UI roles ('petani', 'umkm', 'admin')
    const roleMap = {
        'FARMER': 'petani',
        'UMKM': 'umkm',
        'ADMIN': 'admin'
    };
    
    /** @type {Record<string, number>} */
    const roleDist = {};
    for (const group of roleGroup) {
        const uiRole = roleMap[group.role] || group.role.toLowerCase();
        roleDist[uiRole] = group._count.role;
    }

    // 3. Registered Users (let's fetch top 50 recently registered)
    const dbUsers = await prisma.user.findMany({
        select: {
            name: true,
            role: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 50
    });
    
    const registeredUsers = dbUsers.map(u => ({
        username: u.name,
        role: roleMap[u.role] || u.role.toLowerCase(),
        createdAt: u.createdAt.toISOString()
    }));

    // 4. Activities
    // Let's get recent 15 harvest batches and recent 15 orders, then combine them.
    const recentBatches = await prisma.harvestBatch.findMany({
        include: {
            farmer: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
    });
    
    const recentOrders = await prisma.order.findMany({
        include: {
            umkm: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 15
    });

    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15
    });
    
    const activities = [];
    
    for (const batch of recentBatches) {
        activities.push({
            action: 'Tambah Panen Baru',
            detail: `${Number(batch.quantityKg)}kg ${batch.commodity} dengan harga Rp${Number(batch.pricePerKg).toLocaleString('id-ID')}/kg`,
            role: 'petani',
            username: batch.farmer?.user?.name || 'Unknown',
            timestamp: batch.createdAt.toISOString(),
            dateObj: batch.createdAt
        });
    }
    
    for (const order of recentOrders) {
        activities.push({
            action: 'Buat Pesanan B2B',
            detail: `${Number(order.quantityKg)}kg ${order.commodity} dibutuhkan tanggal ${order.neededDate.toLocaleDateString('id-ID')}`,
            role: 'umkm',
            username: order.umkm?.user?.name || 'Unknown',
            timestamp: order.createdAt.toISOString(),
            dateObj: order.createdAt
        });
    }

    for (const user of recentUsers) {
        activities.push({
            action: 'Registrasi Pengguna',
            detail: `Mendaftar sebagai ${roleMap[user.role] || user.role}`,
            role: roleMap[user.role] || user.role.toLowerCase(),
            username: user.name,
            timestamp: user.createdAt.toISOString(),
            dateObj: user.createdAt
        });
    }
    
    // Sort combined activities by date descending
    activities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    
    const recentActivities = activities.slice(0, 20).map(a => {
        // remove dateObj before sending to client
        const { dateObj, ...rest } = a;
        return rest;
    });

    // 5. Today's activities
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayBatchesCount = await prisma.harvestBatch.count({
        where: { createdAt: { gte: startOfToday } }
    });
    const todayOrdersCount = await prisma.order.count({
        where: { createdAt: { gte: startOfToday } }
    });
    const todayUsersCount = await prisma.user.count({
        where: { createdAt: { gte: startOfToday } }
    });
    
    const todayActivities = todayBatchesCount + todayOrdersCount + todayUsersCount;
    
    const totalActivities = await prisma.harvestBatch.count() + await prisma.order.count() + totalUsers;

    return {
        summary: {
            totalUsers,
            todayActivities,
            totalActivities,
            roleDist,
            recentActivities
        },
        registeredUsers
    };
}
