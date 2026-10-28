import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    let userId = session?.userId;

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@shopsense.com" },
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        retailer: {
          select: { storeName: true, storeSlug: true },
        },
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        shipments: { take: 1 },
      },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      retailer: o.retailer,
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        title: i.titleSnapshot,
        price: i.priceSnapshot,
        quantity: i.quantity,
        image: i.product.images[0]?.url,
      })),
      shipment: o.shipments[0] || null,
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
