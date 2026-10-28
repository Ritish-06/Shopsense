import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "shopsense-secret-jwt-key-2026-production";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "RETAILER" | "ADMIN";
  retailerProfileId?: string | null;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("shopsense_session")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAuth(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

export async function requireRole(allowedRoles: Array<"CUSTOMER" | "RETAILER" | "ADMIN">): Promise<SessionPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Role '${user.role}' is not permitted to access this resource.`);
  }
  return user;
}

export async function requireRetailer(): Promise<{ user: SessionPayload; retailerId: string }> {
  const user = await requireRole(["RETAILER", "ADMIN"]);
  let retailerId = user.retailerProfileId;

  if (!retailerId) {
    const profile = await prisma.retailerProfile.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!profile) {
      throw new Error("Forbidden: No active retailer profile attached to this account.");
    }
    retailerId = profile.id;
  }

  return { user, retailerId };
}
