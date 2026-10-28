import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const addItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let userId = session?.userId;

    if (!userId) {
      // Default to demo customer for instant interactive shopping experience
      const demoUser = await prisma.user.findUnique({
        where: { email: "customer@shopsense.com" },
      });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "User session required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid item payload" }, { status: 400 });
    }

    const { productId, variantId, quantity } = parsed.data;

    // Verify product & stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: { take: 1 } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stock = product.inventory[0]?.quantity ?? 0;
    if (stock < quantity) {
      return NextResponse.json({ error: `Only ${stock} items available in stock` }, { status: 400 });
    }

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (stock < newQty) {
        return NextResponse.json(
          { error: `Cannot add more. Only ${stock} items available in stock` },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Cart items POST error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity update" }, { status: 400 });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart items PATCH error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart items DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
