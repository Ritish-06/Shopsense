import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeRetailerKPIs } from "@/lib/retail-intelligence";

export async function GET() {
  try {
    const session = await getCurrentUser();
    let retailerId = session?.retailerProfileId;

    if (!retailerId) {
      const apex = await prisma.retailerProfile.findFirst({
        where: { storeSlug: "apex-tech-direct" },
      });
      retailerId = apex?.id;
    }

    if (!retailerId) {
      return NextResponse.json({ error: "Retailer profile required" }, { status: 403 });
    }

    // 1. Compute KPIs
    const kpis = await computeRetailerKPIs(retailerId, 30);

    // 2. Fetch recent orders
    const recentOrders = await prisma.order.findMany({
      where: { retailerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: { take: 1 },
      },
    });

    // 3. Fetch sales time-series for chart (last 14 days)
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const salesEvents = await prisma.salesEvent.findMany({
      where: {
        retailerId,
        eventDate: { gte: cutoff },
      },
      orderBy: { eventDate: "asc" },
    });

    // Group by date
    const dailyMap = new Map<string, { revenue: number; units: number; profit: number }>();
    salesEvents.forEach((se) => {
      const dateKey = new Date(se.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const cur = dailyMap.get(dateKey) || { revenue: 0, units: 0, profit: 0 };
      cur.revenue += se.revenue;
      cur.units += se.units;
      cur.profit += se.profit;
      dailyMap.set(dateKey, cur);
    });

    const chartData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue),
      units: data.units,
      profit: Math.round(data.profit),
    }));

    // 4. Fetch low-stock alert count
    const lowStockInventory = await prisma.inventory.findMany({
      where: {
        retailerId,
        quantity: { lte: 15 },
      },
      include: {
        product: { select: { title: true, brand: true } },
      },
      take: 4,
    });

    return NextResponse.json({
      kpis,
      chartData,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
        firstItem: o.items[0]?.titleSnapshot || "Tech Gear",
      })),
      lowStockAlerts: lowStockInventory.map((i) => ({
        productId: i.productId,
        title: i.product.title,
        brand: i.product.brand,
        quantity: i.quantity,
        reorderPoint: i.reorderPoint,
      })),
    });
  } catch (error) {
    console.error("Retailer overview error:", error);
    return NextResponse.json({ error: "Failed to load retailer dashboard" }, { status: 500 });
  }
}
