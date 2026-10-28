import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const session = await getCurrentUser();
    let userId = session?.userId;

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@shopsense.com" },
      });
      userId = demoUser?.id;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        retailer: true,
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        payments: true,
        shipments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Security check: Customer can only view their own orders unless ADMIN
    if (session && session.role !== "ADMIN" && session.role !== "RETAILER" && order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    const address = JSON.parse(order.shippingAddressJson || "{}");

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        shippingAddress: address,
        retailer: {
          storeName: order.retailer.storeName,
          contactEmail: order.retailer.contactEmail,
        },
        items: order.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          title: i.titleSnapshot,
          price: i.priceSnapshot,
          quantity: i.quantity,
          image: i.product.images[0]?.url,
        })),
        payment: order.payments[0] || null,
        shipment: order.shipments[0] || null,
      },
    });
  } catch (error) {
    console.error("Order detail GET error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}
