"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowRightLeft,
  Check,
  Eye,
  X,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "./Button";
import { StockBadge } from "./StockBadge";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  brand: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image?: string;
  category?: { name: string; slug: string };
  inventoryQuantity?: number;
  description?: string;
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
  isWishlisted: externalIsWishlisted,
  isCompared: externalIsCompared,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [internalWishlisted, setInternalWishlisted] = useState(false);
  const [internalCompared, setInternalCompared] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Sync internal wishlist & compare from localStorage if not provided externally
  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem("shopsense_wishlist") || "[]");
      if (Array.isArray(savedWishlist) && savedWishlist.includes(product.id)) {
        setInternalWishlisted(true);
      }
      const savedCompare = JSON.parse(localStorage.getItem("shopsense_compare") || "[]");
      if (Array.isArray(savedCompare) && savedCompare.includes(product.id)) {
        setInternalCompared(true);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, [product.id]);

  const isWishlisted = externalIsWishlisted !== undefined ? externalIsWishlisted : internalWishlisted;
  const isCompared = externalIsCompared !== undefined ? externalIsCompared : internalCompared;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    } else {
      try {
        const list = JSON.parse(localStorage.getItem("shopsense_wishlist") || "[]");
        const next = isWishlisted ? list.filter((id: string) => id !== product.id) : [...list, product.id];
        localStorage.setItem("shopsense_wishlist", JSON.stringify(next));
        setInternalWishlisted(!isWishlisted);
        window.dispatchEvent(new CustomEvent("shopsense:wishlist-updated"));
      } catch {
        setInternalWishlisted(!isWishlisted);
      }
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(product.id);
    } else {
      try {
        const list = JSON.parse(localStorage.getItem("shopsense_compare") || "[]");
        const next = isCompared ? list.filter((id: string) => id !== product.id) : [...list.slice(-3), product.id];
        localStorage.setItem("shopsense_compare", JSON.stringify(next));
        setInternalCompared(!isCompared);
        window.dispatchEvent(new CustomEvent("shopsense:compare-updated"));
      } catch {
        setInternalCompared(!isCompared);
      }
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inventoryQuantity === 0) return;

    setIsAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product.id);
      } else {
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: 1 }),
        });
      }
      setJustAdded(true);
      window.dispatchEvent(new CustomEvent("shopsense:cart-updated"));
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const isLowStock =
    product.inventoryQuantity !== undefined &&
    product.inventoryQuantity <= 15 &&
    product.inventoryQuantity > 0;

  const hasGenuineDiscount =
    product.originalPrice !== undefined &&
    product.originalPrice > product.basePrice;

  const discountPercent = hasGenuineDiscount
    ? Math.round(((product.originalPrice! - product.basePrice) / product.originalPrice!) * 100)
    : 0;

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-card">
        <div>
          {/* Image Container with Smooth Zoom & Quick Actions */}
          <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
            <Link href={`/products/${product.slug}`} className="block h-full w-full">
              <img
                src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop"}
                alt={product.title}
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </Link>

            {/* Badges on top-left */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10 pointer-events-none">
              {product.category && (
                <span className="rounded-md bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 shadow-sm backdrop-blur-md">
                  {product.category.name}
                </span>
              )}
              {hasGenuineDiscount && (
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {discountPercent}% OFF
                </span>
              )}
              {isLowStock && (
                <span className="rounded-md bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  Low Stock
                </span>
              )}
            </div>

            {/* Floating Quick Actions (Wishlist, Compare, Quick View) */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10 opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-card transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isWishlisted ? "text-red-600" : "text-zinc-600 hover:text-red-600"
                }`}
              >
                <Heart className="h-4 w-4" fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={handleToggleCompare}
                aria-label={isCompared ? "Remove from compare" : "Add to compare"}
                title={isCompared ? "In Comparison" : "Compare Specs"}
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-card transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isCompared ? "bg-blue-600 text-white" : "text-zinc-600 hover:text-blue-600"
                }`}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                aria-label="Quick preview of product"
                title="Quick View"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-600 shadow-card transition-all duration-200 hover:scale-110 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[11px]">
                {product.brand}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-zinc-900">{product.rating.toFixed(1)}</span>
                <span className="text-zinc-400">({product.reviewCount})</span>
              </div>
            </div>

            <Link href={`/products/${product.slug}`} className="mt-1.5 block group-hover:text-blue-600">
              <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 transition-colors">
                {product.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Price & Primary Action */}
        <div className="border-t border-zinc-100 p-4 pt-3">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-900">
                {formatCurrency(product.basePrice)}
              </span>
              {hasGenuineDiscount && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice!)}
                </span>
              )}
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
            className="w-full text-xs font-semibold rounded-xl transition-all duration-200"
            size="sm"
            aria-label={justAdded ? "Added to cart" : `Add ${product.title} to cart`}
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

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setQuickViewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`quickview-title-${product.id}`}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop"}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {product.brand}
                    </span>
                    {product.category && (
                      <span className="text-xs text-zinc-400">• {product.category.name}</span>
                    )}
                  </div>

                  <h3 id={`quickview-title-${product.id}`} className="mt-1 text-lg font-bold text-zinc-900">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-zinc-800">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-400">({product.reviewCount} reviews)</span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-zinc-900">
                      {formatCurrency(product.basePrice)}
                    </span>
                    {hasGenuineDiscount && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatCurrency(product.originalPrice!)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-zinc-600">Zero AI Hallucinations • Verified Catalog Specs</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-100">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.inventoryQuantity === 0}
                    isLoading={isAdding}
                    variant={justAdded ? "emerald" : "default"}
                    className="w-full text-sm font-semibold rounded-xl"
                  >
                    {justAdded ? "Added to Cart!" : "Add to Cart"}
                  </Button>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => setQuickViewOpen(false)}
                    className="block text-center text-xs font-semibold text-blue-600 hover:underline py-1.5"
                  >
                    View Full 90-Day Price & Review Intelligence →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
