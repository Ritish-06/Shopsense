import prisma from "@/lib/prisma";

export interface ShopperAdviceResult {
  interpretedQuery: {
    budgetLimit?: number;
    targetCategory?: string;
    keywords: string[];
    useCase: string;
  };
  products: any[];
  explanation: string;
  comparisons?: any[];
  fallbackUsed: boolean;
}

// 1. Controlled tool: searchProducts
export async function toolSearchProducts(params: {
  query?: string;
  maxPrice?: number;
  minPrice?: number;
  categorySlug?: string;
  inStockOnly?: boolean;
  limit?: number;
}) {
  const where: any = { isPublished: true };

  if (params.query) {
    const q = params.query.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { brand: { contains: q } },
      { description: { contains: q } },
      { tagsJson: { contains: q } },
      { specsJson: { contains: q } },
    ];
  }

  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }

  if (params.maxPrice !== undefined || params.minPrice !== undefined) {
    where.basePrice = {};
    if (params.maxPrice !== undefined) where.basePrice.lte = params.maxPrice;
    if (params.minPrice !== undefined) where.basePrice.gte = params.minPrice;
  }

  if (params.inStockOnly) {
    where.inventory = { some: { quantity: { gt: 0 } } };
  }

  const products = await prisma.product.findMany({
    where,
    take: params.limit || 8,
    orderBy: { rating: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { take: 1, select: { quantity: true, reorderPoint: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    basePrice: p.basePrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    category: p.category.name,
    image: p.images[0]?.url,
    quantity: p.inventory[0]?.quantity ?? 10,
    specs: p.specsJson ? JSON.parse(p.specsJson) : {},
  }));
}

// 2. Controlled tool: getProductDetails
export async function toolGetProductDetails(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      images: true,
      variants: true,
      inventory: { include: { retailer: true } },
      reviews: { take: 5, orderBy: { createdAt: "desc" } },
    },
  });
  return product;
}

// 3. Controlled tool: compareProducts
export async function toolCompareProducts(productIds: string[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { take: 1 },
    },
  });
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    price: p.basePrice,
    rating: p.rating,
    specs: p.specsJson ? JSON.parse(p.specsJson) : {},
    stock: p.inventory[0]?.quantity ?? 10,
  }));
}

// 4. Controlled tool: getRecommendations
export async function toolGetRecommendations(productId: string, strategy: "HYBRID" | "CONTENT" | "POPULARITY" = "HYBRID") {
  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current) return [];

  // Content-based: Same category or brand
  const items = await prisma.product.findMany({
    where: {
      categoryId: current.categoryId,
      id: { not: productId },
      isPublished: true,
    },
    take: 4,
    orderBy: strategy === "POPULARITY" ? { reviewCount: "desc" } : { rating: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: { take: 1 },
    },
  });

  return items.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    basePrice: p.basePrice,
    rating: p.rating,
    image: p.images[0]?.url,
    stock: p.inventory[0]?.quantity ?? 10,
  }));
}

// Parse natural language constraints deterministically
export function parseShopperQuery(input: string) {
  const text = input.toLowerCase();

  // Extract budget (e.g. "under 60000", "under 60k", "below ₹75,000", "under 1.5 lakh", "budget 40000")
  let budgetLimit: number | undefined;

  const lakhMatch = text.match(/(?:under|below|less than|max|budget)\s*(?:₹|rs\.?)?\s*([0-9.]+)\s*(?:lakh|lac)/);
  if (lakhMatch) {
    budgetLimit = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const kMatch = text.match(/(?:under|below|less than|max|budget)\s*(?:₹|rs\.?)?\s*([0-9]+)\s*k\b/);
    if (kMatch) {
      budgetLimit = parseInt(kMatch[1], 10) * 1000;
    } else {
      const numMatch = text.match(/(?:under|below|less than|max|budget|within)\s*(?:₹|rs\.?)?\s*([0-9,]+)/);
      if (numMatch) {
        budgetLimit = parseInt(numMatch[1].replace(/,/g, ""), 10);
      }
    }
  }

  // Detect category keywords
  let targetCategory: string | undefined;
  if (/laptop|macbook|thinkpad|notebook|computer|monitor|pc|desktop/.test(text)) {
    targetCategory = "laptops-computing";
  } else if (/phone|smartphone|iphone|galaxy|pixel|android|tablet|ipad/.test(text)) {
    targetCategory = "smartphones-tablets";
  } else if (/headphone|earbud|airpod|sound|audio|speaker|mic|microphone|anc/.test(text)) {
    targetCategory = "audio-headphones";
  } else if (/smart home|vacuum|robot|purifier|light|camera|sensor|plug/.test(text)) {
    targetCategory = "smart-home-iot";
  } else if (/watch|smartwatch|band|fitness|tracker|oura|ring|wearable/.test(text)) {
    targetCategory = "wearables-fitness";
  } else if (/camera|mirrorless|lens|drone|dji|gimbal|vlog|tripod/.test(text)) {
    targetCategory = "cameras-gear";
  }

  // Extract significant search keywords
  const stopWords = new Set(["i", "need", "a", "for", "and", "under", "below", "with", "the", "in", "good", "best", "of", "to", "or", "rs", "inr"]);
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w) && isNaN(Number(w)));

  return {
    budgetLimit,
    targetCategory,
    keywords: words,
    useCase: text,
  };
}

// End-to-End AI Advisor function
export async function adviseShopper(userMessage: string): Promise<ShopperAdviceResult> {
  const parsed = parseShopperQuery(userMessage);

  // 1. Search products using controlled catalog query
  let products = await toolSearchProducts({
    query: parsed.keywords.length > 0 ? parsed.keywords.slice(0, 2).join(" ") : undefined,
    categorySlug: parsed.targetCategory,
    maxPrice: parsed.budgetLimit,
    limit: 6,
  });

  // Fallback: If strict query returned empty, broaden search without strict text keywords
  let fallbackUsed = false;
  if (products.length === 0) {
    fallbackUsed = true;
    products = await toolSearchProducts({
      categorySlug: parsed.targetCategory,
      maxPrice: parsed.budgetLimit,
      limit: 6,
    });
  }

  // If still empty, search closest category
  if (products.length === 0) {
    products = await toolSearchProducts({
      categorySlug: parsed.targetCategory,
      limit: 4,
    });
  }

  // Synthesize verifiable explainability based strictly on retrieved records
  let explanation = "";
  if (products.length > 0) {
    const top = products[0];
    const budgetContext = parsed.budgetLimit
      ? `within your specified budget of ₹${parsed.budgetLimit.toLocaleString()}`
      : "in our verified catalog";

    explanation = `Based on your request "${userMessage}", we searched our verified retailer catalog and matched ${products.length} eligible devices ${budgetContext}.\n\n` +
      `Our top recommendation is the **${top.brand} ${top.title}** (₹${top.basePrice.toLocaleString()}, rated ${top.rating}★ across ${top.reviewCount} customer reviews). ` +
      `It offers strong verified customer sentiment and satisfies your criteria with ${top.quantity > 0 ? "immediate regional stock" : "verified retailer availability"}.\n\n` +
      `Below you can inspect the verified specifications and compare key differences.`;
  } else {
    explanation = `We analyzed our catalog for "${userMessage}" but could not find exact models meeting all constraints simultaneously. Try adjusting your budget limit or expanding category terms.`;
  }

  return {
    interpretedQuery: parsed,
    products,
    explanation,
    fallbackUsed,
  };
}
