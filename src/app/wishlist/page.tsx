"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StockBadge } from "@/components/ui/StockBadge";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch a sample of catalog items as demo saved wishlist items
    fetch("/api/products?limit=4&sort=rating")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setItems(data.products.slice(0, 3));
      })
      .catch((err) => console.error("Error loading wishlist:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleAddToCart = async (product: any) => {
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    handleRemove(product.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading your saved wishlist...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save products you want to track or purchase later by clicking the heart icon on any product."
          actionLabel="Explore Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Saved Wishlist</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {items.length} items saved for future purchasing or price tracking.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300"
          >
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 p-1">
                <img src={item.image} alt="" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {item.brand}
                </span>
                <Link href={`/products/${item.slug}`}>
                  <h3 className="text-sm font-semibold text-zinc-900 hover:text-blue-600 line-clamp-1">
                    {item.title}
                  </h3>
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">
                    {formatCurrency(item.basePrice)}
                  </span>
                  <StockBadge quantity={item.inventoryQuantity ?? 10} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0">
              <Button
                onClick={() => handleAddToCart(item)}
                size="sm"
                className="text-xs font-semibold rounded-lg"
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Move to Cart
              </Button>

              <button
                onClick={() => handleRemove(item.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
