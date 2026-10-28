import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";
import { z } from "zod";

const switchSchema = z.object({
  role: z.enum(["CUSTOMER", "RETAILER", "ADMIN"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = switchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid demo role" }, { status: 400 });
    }

    const emailMap = {
      CUSTOMER: "customer@shopsense.com",
      RETAILER: "apex@shopsense.com",
      ADMIN: "admin@shopsense.com",
    };

    const targetEmail = emailMap[parsed.data.role];
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { retailerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: `Demo account for ${parsed.data.role} not found` }, { status: 404 });
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "CUSTOMER" | "RETAILER" | "ADMIN",
      retailerProfileId: user.retailerProfile?.id || null,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        retailerProfile: user.retailerProfile,
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
    console.error("Demo switch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
