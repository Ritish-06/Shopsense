import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateDemandForecast } from "@/lib/retail-intelligence";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");
    const horizonDays = parseInt(searchParams.get("horizonDays") || "14", 10);
    const model = (searchParams.get("model") || "EXPONENTIAL_SMOOTHING") as any;

    // Fetch retailer's products for selection dropdown
    const retailerProducts = await prisma.product.findMany({
      where: {
        inventory: { some: { retailerId } },
      },
      select: { id: true, title: true, brand: true },
    });

    if (!productId && retailerProducts.length > 0) {
      productId = retailerProducts[0].id;
    }

    if (!productId) {
      return NextResponse.json({ error: "No products available for forecasting" }, { status: 404 });
    }

    const forecast = await generateDemandForecast(retailerId, productId, horizonDays, model);

    return NextResponse.json({
      forecast,
      availableProducts: retailerProducts,
    });
  } catch (error) {
    console.error("Retailer forecast API error:", error);
    return NextResponse.json({ error: "Failed to generate demand forecast" }, { status: 500 });
  }
}
