import prisma from '../../utils/prisma';

export class DashboardService {
  async getStats() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Run dashboard counts and aggregations parallelly
    const [
      totalCustomers,
      totalProducts,
      confirmedChallansThisMonth,
      allProducts,
      recentChallans,
      recentMovements,
    ] = await Promise.all([
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.challan.findMany({
        where: {
          status: 'CONFIRMED',
          confirmedAt: { gte: startOfMonth },
        },
        select: {
          totalAmount: true,
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          minimumStock: true,
        },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
        },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true } },
          user: { select: { name: true } },
        },
      }),
    ]);

    // Calculate low stock count
    const lowStockCount = allProducts.filter((p) => p.currentStock <= p.minimumStock).length;

    // Calculate monthly sales revenue
    const monthlyRevenue = confirmedChallansThisMonth.reduce((acc, c) => acc + c.totalAmount, 0);

    return {
      stats: {
        activeCustomers: totalCustomers,
        totalProducts,
        lowStockItems: lowStockCount,
        monthlyRevenue,
        monthlyChallansCount: confirmedChallansThisMonth.length,
      },
      recentChallans: recentChallans.map((c) => ({
        id: c.id,
        challanNumber: c.challanNumber,
        customerName: c.customer.businessName || c.customer.name,
        status: c.status,
        totalAmount: c.totalAmount,
        createdAt: c.createdAt,
      })),
      recentActivity: recentMovements.map((m) => ({
        id: m.id,
        productName: m.product.name,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        userName: m.user.name,
        createdAt: m.createdAt,
      })),
    };
  }
}
