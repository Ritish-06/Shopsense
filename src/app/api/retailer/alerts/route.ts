import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const [insights, notifications] = await Promise.all([
      prisma.businessInsight.findMany({
        where: { retailerId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: { retailerId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      insights: insights.map((i) => ({
        id: i.id,
        title: i.title,
        insightType: i.insightType,
        summary: i.summary,
        recommendation: i.recommendation,
        severity: i.severity,
        metrics: i.metricsJson ? JSON.parse(i.metricsJson) : {},
        createdAt: i.createdAt,
      })),
      notifications,
    });
  } catch (error) {
    console.error("Retailer alerts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
