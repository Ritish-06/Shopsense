import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const inStockOnly = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "featured";
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { brand: { contains: q } },
        { description: { contains: q } },
        { tagsJson: { contains: q.toLowerCase() } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (brand) {
      where.brand = brand;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    if (inStockOnly) {
      where.inventory = {
        some: {
          quantity: { gt: 0 },
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { basePrice: "asc" };
    else if (sort === "price-desc") orderBy = { basePrice: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "reviews") orderBy = { reviewCount: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
          inventory: {
            take: 1,
            select: { quantity: true, reorderPoint: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => ({
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

    return NextResponse.json({
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
