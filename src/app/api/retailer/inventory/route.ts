import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeInventoryIntelligence } from "@/lib/retail-intelligence";
import { z } from "zod";

const adjustStockSchema = z.object({
  inventoryId: z.string(),
  newQuantity: z.number().int().min(0),
  reason: z.enum(["RESTOCK", "DAMAGE", "RECONCILIATION", "CYCLE_COUNT"]).default("RECONCILIATION"),
  note: z.string().optional(),
});

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

    const inventory = await computeInventoryIntelligence(retailerId);
    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Retailer inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = adjustStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid adjustment payload" }, { status: 400 });
    }

    const { inventoryId, newQuantity, reason, note } = parsed.data;

    // Enforce ownership: inventory must belong to retailer
    const existing = await prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        retailerId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Inventory record not found or access denied" }, { status: 404 });
    }

    const previousQty = existing.quantity;
    const changeQty = newQuantity - previousQty;

    // Concurrency-safe transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: newQuantity },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId,
          changeQuantity: changeQty,
          previousQuantity: previousQty,
          newQuantity,
          reason,
          referenceId: note || "MANUAL_RETAILER_ADJUSTMENT",
        },
      });

      // Audit log entry
      await tx.auditLog.create({
        data: {
          retailerId,
          action: "ADJUST_STOCK",
          entityType: "Inventory",
          entityId: inventoryId,
          detailsJson: JSON.stringify({ previousQty, newQuantity, changeQty, reason, note }),
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Stock successfully adjusted from ${previousQty} to ${newQuantity}`,
      inventory: result,
    });
  } catch (error) {
    console.error("Retailer inventory POST error:", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}
