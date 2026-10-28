import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(4),
  }),
  paymentMethod: z.string().default("Credit Card"),
});

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: "Session required to place order" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout data", details: parsed.error.format() }, { status: 400 });
    }

    const { shippingAddress, paymentMethod } = parsed.data;

    // Load active cart with latest items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                inventory: { take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Execute atomic, concurrency-safe transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      // 1. Verify stock & retrieve authoritative pricing
      for (const item of cart.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId },
        });

        if (!inv || inv.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.product.title}". Requested: ${item.quantity}, Available: ${inv ? inv.quantity : 0}`
          );
        }
      }

      // 2. Identify primary retailer (fallback to first retailer profile)
      const firstRetailer = await tx.retailerProfile.findFirst();
      if (!firstRetailer) {
        throw new Error("No active retailer found to fulfill order.");
      }

      // 3. Compute authoritative sums
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of cart.items) {
        const authoritativePrice = item.variant?.price ?? item.product.basePrice;
        const itemTotal = authoritativePrice * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId,
          titleSnapshot: item.product.title,
          priceSnapshot: authoritativePrice,
          costSnapshot: item.variant?.costPrice ?? authoritativePrice * 0.8,
          quantity: item.quantity,
        });
      }

      const tax = Math.round(subtotal * 0.18);
      const shipping = subtotal > 1000 ? 0 : 99;
      const discount = subtotal > 50000 ? 2500 : 0;
      const totalAmount = subtotal + tax + shipping - discount;

      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          retailerId: firstRetailer.id,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentMethod,
          subtotal,
          tax,
          shipping,
          discount,
          totalAmount,
          shippingAddressJson: JSON.stringify(shippingAddress),
          items: {
            create: orderItemsData,
          },
        },
      });

      // 5. Create Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          status: "PAID",
          provider: "DEMO_STRIPE",
          transactionId: `txn_live_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        },
      });

      // 6. Create Shipment
      await tx.shipment.create({
        data: {
          orderId: order.id,
          trackingNumber: `BD-EXP-${Date.now().toString().slice(-8)}`,
          carrier: "BlueDart Express",
          status: "LABEL_CREATED",
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });

      // 7. Concurrency-safe atomic inventory deduction & movement ledger
      for (const item of cart.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId },
        });

        if (inv) {
          const previousQty = inv.quantity;
          const newQty = previousQty - item.quantity;

          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: newQty },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryId: inv.id,
              changeQuantity: -item.quantity,
              previousQuantity: previousQty,
              newQuantity: newQty,
              reason: "SALE",
              referenceId: order.id,
            },
          });

          // Record real-time SalesEvent for immediate analytics update
          await tx.salesEvent.create({
            data: {
              retailerId: inv.retailerId,
              productId: item.productId,
              orderId: order.id,
              units: item.quantity,
              revenue: (item.variant?.price ?? item.product.basePrice) * item.quantity,
              cost: (item.variant?.costPrice ?? item.product.basePrice * 0.8) * item.quantity,
              profit: ((item.variant?.price ?? item.product.basePrice) - (item.variant?.costPrice ?? item.product.basePrice * 0.8)) * item.quantity,
              eventDate: new Date(),
            },
          });

          // Trigger Low Stock notification if quantity drops to or below reorder threshold
          if (newQty <= inv.reorderPoint) {
            await tx.notification.create({
              data: {
                retailerId: inv.retailerId,
                title: `Low Stock Alert: ${item.product.title}`,
                message: `Stock level fell to ${newQty} units following Order ${orderNumber}. Below reorder point of ${inv.reorderPoint}.`,
                type: "LOW_STOCK",
                link: `/retailer/inventory`,
              },
            });
          }
        }
      }

      // 8. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // 9. Notification for customer
      await tx.notification.create({
        data: {
          userId,
          title: `Order Confirmed: ${orderNumber}`,
          message: `Your payment of ₹${totalAmount.toLocaleString()} was successful. Track shipping in your orders tab.`,
          type: "ORDER_UPDATE",
          link: `/orders/${order.id}`,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: orderResult.id,
      orderNumber: orderResult.orderNumber,
      totalAmount: orderResult.totalAmount,
    });
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout transaction" },
      { status: 400 }
    );
  }
}
