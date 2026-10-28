import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId;

    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                  inventory: { take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                    inventory: { take: 1 },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }
    } else {
      return NextResponse.json({
        cart: {
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
        },
      });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.product.title,
      slug: item.product.slug,
      brand: item.product.brand,
      price: item.variant?.price ?? item.product.basePrice,
      quantity: item.quantity,
      image: item.product.images[0]?.url,
      availableStock: item.product.inventory[0]?.quantity ?? 10,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99;
    const discount = subtotal > 50000 ? 2500 : 0;
    const total = subtotal + tax + shipping - discount;

    return NextResponse.json({
      cart: {
        id: cart.id,
        items,
        subtotal,
        tax,
        shipping,
        discount,
        total,
      },
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}
