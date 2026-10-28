import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "RETAILER"]).default("CUSTOMER"),
  storeName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, password, role, storeName, contactPhone } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      });

      let retailerProfile = null;
      if (role === "RETAILER") {
        const slug = (storeName || `${name}'s Store`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        retailerProfile = await tx.retailerProfile.create({
          data: {
            userId: user.id,
            storeName: storeName || `${name}'s Store`,
            storeSlug: `${slug}-${Date.now().toString().slice(-4)}`,
            contactEmail: email,
            contactPhone: contactPhone || "",
            isVerified: true,
          },
        });
      } else {
        await tx.cart.create({ data: { userId: user.id } });
        await tx.wishlist.create({ data: { userId: user.id } });
      }

      return { user, retailerProfile };
    });

    const token = signSessionToken({
      userId: newUser.user.id,
      email: newUser.user.email,
      name: newUser.user.name,
      role: newUser.user.role as "CUSTOMER" | "RETAILER" | "ADMIN",
      retailerProfileId: newUser.retailerProfile?.id || null,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        name: newUser.user.name,
        role: newUser.user.role,
        retailerProfile: newUser.retailerProfile,
      },
    });

    res.cookies.set("shopsense_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
