import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { answerBusinessQuery } from "@/lib/ai-analyst";
import { z } from "zod";

const analystQuerySchema = z.object({
  question: z.string().min(2).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let retailerId = session?.retailerProfileId;

    if (!retailerId) {
      // Default to Apex Tech Direct for demo exploration
      const apex = await prisma.retailerProfile.findFirst({
        where: { storeSlug: "apex-tech-direct" },
      });
      retailerId = apex?.id;
    }

    if (!retailerId) {
      return NextResponse.json({ error: "Retailer profile required to access business analyst" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = analystQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid question query" }, { status: 400 });
    }

    const response = await answerBusinessQuery(retailerId, parsed.data.question);
    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Business Analyst error:", error);
    return NextResponse.json({ error: "Failed to evaluate business query" }, { status: 500 });
  }
}
