import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        inventory: {
          include: {
            retailer: {
              select: {
                id: true,
                storeName: true,
                storeSlug: true,
                isVerified: true,
                address: true,
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: { select: { name: true } },
          },
        },
        priceHistory: {
          orderBy: { recordedAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { take: 1, select: { quantity: true } },
      },
    });

    const formattedSimilar = similarProducts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      brand: p.brand,
      basePrice: p.basePrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      category: p.category,
      image: p.images[0]?.url,
      inventoryQuantity: p.inventory[0]?.quantity ?? 10,
    }));

    // Aggregate Review Sentiment
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    const aspectSummary: Record<string, { positive: number; negative: number; neutral: number }> = {};

    product.reviews.forEach((r) => {
      if ((r.sentimentScore ?? 0) > 0.2) positiveCount++;
      else if ((r.sentimentScore ?? 0) < -0.2) negativeCount++;
      else neutralCount++;

      if (r.aspectsJson) {
        try {
          const parsed = JSON.parse(r.aspectsJson);
          for (const [key, val] of Object.entries(parsed)) {
            if (!aspectSummary[key]) {
              aspectSummary[key] = { positive: 0, negative: 0, neutral: 0 };
            }
            if (val === "positive") aspectSummary[key].positive++;
            else if (val === "negative") aspectSummary[key].negative++;
            else aspectSummary[key].neutral++;
          }
        } catch {}
      }
    });

    const parsedSpecs = product.specsJson ? JSON.parse(product.specsJson) : {};

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        brand: product.brand,
        basePrice: product.basePrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category,
        specs: parsedSpecs,
        images: product.images,
        variants: product.variants,
        inventory: product.inventory,
        priceHistory: product.priceHistory,
        reviews: product.reviews,
        reviewIntelligence: {
          totalReviews: product.reviews.length,
          sentiment: {
            positive: positiveCount,
            neutral: neutralCount,
            negative: negativeCount,
          },
          aspects: aspectSummary,
        },
      },
      similarProducts: formattedSimilar,
    });
  } catch (error) {
    console.error("Product slug API error:", error);
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 });
  }
}
