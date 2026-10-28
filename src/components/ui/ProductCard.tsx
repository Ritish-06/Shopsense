"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, ArrowRightLeft, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { StockBadge } from "./StockBadge";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  brand: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  image?: string;
  category?: { name: string; slug: string };
  inventoryQuantity?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => Promise<void> | void;
  onToggleWishlist?: (productId: string) => void;
  onToggleCompare?: (productId: string) => void;
  isWishlisted?: boolean;
  isCompared?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  isWishlisted = false,
  isCompared = false,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product.id);
      } else {
        // Fallback default API call
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const isLowStock = product.inventoryQuantity !== undefined && product.inventoryQuantity <= 15 && product.inventoryQuantity > 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card">
      <div>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <img
              src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop"}
              alt={product.title}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges on top */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {product.category && (
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700 backdrop-blur-sm shadow-sm">
                {product.category.name}
              </span>
            )}
            {isLowStock && (
              <span className="rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                Low Stock
              </span>
            )}
          </div>

          {/* Quick Floating Action Buttons */}
          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist?.(product.id);
              }}
              title="Save to Wishlist"
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 ${
                isWishlisted ? "text-red-600" : "text-zinc-600 hover:text-red-600"
              }`}
            >
              <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleCompare?.(product.id);
              }}
              title="Compare Specifications"
              className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 ${
                isCompared ? "bg-blue-600 text-white" : "text-zinc-600 hover:text-blue-600"
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-medium text-zinc-600 uppercase tracking-wider">{product.brand}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-900">{product.rating.toFixed(1)}</span>
              <span className="text-zinc-400">({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/products/${product.slug}`} className="mt-1.5 block">
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors hover:text-blue-600">
              {product.title}
            </h3>
          </Link>
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="border-t border-zinc-100 p-4 pt-3">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <span className="text-lg font-bold text-zinc-900">{formatCurrency(product.basePrice)}</span>
            <span className="ml-2 text-xs text-zinc-400 line-through">
              {formatCurrency(Math.round(product.basePrice * 1.15))}
            </span>
          </div>
          {product.inventoryQuantity !== undefined && (
            <StockBadge quantity={product.inventoryQuantity} showExactCount={false} />
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.inventoryQuantity === 0}
          isLoading={isAdding}
          variant={justAdded ? "emerald" : "default"}
          className="w-full text-xs font-semibold"
          size="sm"
        >
          {justAdded ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Added to Cart
            </>
          ) : product.inventoryQuantity === 0 ? (
            "Sold Out"
          ) : (
            <>
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
