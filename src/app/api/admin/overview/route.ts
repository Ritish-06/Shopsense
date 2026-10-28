import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [userCount, retailerCount, productCount, orderCount, auditLogs] = await Promise.all([
      prisma.user.count(),
      prisma.retailerProfile.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { name: true, email: true } },
          retailer: { select: { storeName: true } },
        },
      }),
    ]);

    const retailers = await prisma.retailerProfile.findMany({
      include: {
        _count: { select: { inventory: true, orders: true } },
      },
    });

    return NextResponse.json({
      metrics: {
        totalUsers: userCount,
        totalRetailers: retailerCount,
        totalProducts: productCount,
        totalOrders: orderCount,
      },
      retailers: retailers.map((r) => ({
        id: r.id,
        storeName: r.storeName,
        storeSlug: r.storeSlug,
        contactEmail: r.contactEmail,
        isVerified: r.isVerified,
        inventoryCount: r._count.inventory,
        orderCount: r._count.orders,
      })),
      recentLogs: auditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        details: l.detailsJson,
        userName: l.user?.name || l.retailer?.storeName || "System Process",
        date: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
