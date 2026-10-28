import { NextRequest, NextResponse } from "next/server";
import { adviseShopper } from "@/lib/ai-advisor";
import { z } from "zod";

const advisorSchema = z.object({
  message: z.string().min(2).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = advisorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid shopping question or requirement" }, { status: 400 });
    }

    const result = await adviseShopper(parsed.data.message);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Advisor error:", error);
    return NextResponse.json({ error: "Shopping advisor service unavailable" }, { status: 500 });
  }
}
