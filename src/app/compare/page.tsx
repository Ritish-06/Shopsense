"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightLeft,
  X,
  Plus,
  Star,
  Check,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StockBadge } from "@/components/ui/StockBadge";

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [comparedProducts, setComparedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPicker, setShowAddPicker] = useState(false);

  // Fetch initial comparison IDs from URL or default to 2 laptops
  useEffect(() => {
    const p1 = searchParams.get("p1");
    const p2 = searchParams.get("p2");

    fetch("/api/products?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setAllProducts(data.products);
          let initial = [];
          if (p1) {
            const found1 = data.products.find((p: any) => p.id === p1);
            if (found1) initial.push(found1);
          }
          if (p2) {
            const found2 = data.products.find((p: any) => p.id === p2);
            if (found2) initial.push(found2);
          }
          if (initial.length === 0 && data.products.length >= 2) {
            initial = [data.products[0], data.products[1]];
          }
          setComparedProducts(initial);
        }
      })
      .catch((err) => console.error("Error loading products for compare:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleAddProduct = (prod: any) => {
    if (comparedProducts.length < 4 && !comparedProducts.some((p) => p.id === prod.id)) {
      const updated = [...comparedProducts, prod];
      setComparedProducts(updated);
      setShowAddPicker(false);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setComparedProducts(comparedProducts.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading product comparisons...
      </div>
    );
  }

  // Key spec rows to compare
  const specFields = ["Brand", "Price", "Rating", "Reviews", "Stock Status"];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 mb-1">
            <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
            Specs Intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Side-by-Side Product Comparison
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Compare up to 4 devices across specifications, pricing, ratings, and stock.
          </p>
        </div>

        {comparedProducts.length < 4 && (
          <Button
            onClick={() => setShowAddPicker(!showAddPicker)}
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Product to Compare ({comparedProducts.length}/4)
          </Button>
        )}
      </div>

      {/* Add Product Modal Drawer */}
      {showAddPicker && (
        <div className="my-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Select a Product to Add to Comparison
            </h3>
            <button
              onClick={() => setShowAddPicker(false)}
              className="text-zinc-500 hover:text-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto pr-1">
            {allProducts
              .filter((p) => !comparedProducts.some((cp) => cp.id === p.id))
              .map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleAddProduct(prod)}
                  className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-3 text-center transition hover:border-blue-500 hover:shadow-sm"
                >
                  <div className="h-14 w-14 overflow-hidden rounded-md bg-zinc-50 p-1 mb-2">
                    <img src={prod.image} alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-900 line-clamp-1">
                    {prod.title}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold mt-1">
                    {formatCurrency(prod.basePrice)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {comparedProducts.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          No products selected for comparison. Click &quot;Add Product&quot; to begin.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400 w-44">
                  Feature
                </th>
                {comparedProducts.map((prod) => (
                  <th key={prod.id} className="p-4 text-left align-top min-w-[220px]">
                    <div className="relative flex flex-col justify-between h-full">
                      <button
                        onClick={() => handleRemoveProduct(prod.id)}
                        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Remove from compare"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <div className="h-28 w-28 mx-auto overflow-hidden rounded-xl bg-white border border-zinc-100 p-2 mb-3">
                        <img src={prod.image} alt="" className="h-full w-full object-contain" />
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {prod.brand}
                      </span>
                      <Link href={`/products/${prod.slug}`} className="block">
                        <h3 className="text-xs font-bold text-zinc-900 hover:text-blue-600 line-clamp-2">
                          {prod.title}
                        </h3>
                      </Link>

                      <div className="mt-3">
                        <span className="text-base font-extrabold text-zinc-900">
                          {formatCurrency(prod.basePrice)}
                        </span>
                      </div>

                      <Button
                        onClick={() => {
                          fetch("/api/cart/items", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ productId: prod.id, quantity: 1 }),
                          });
                          router.push("/cart");
                        }}
                        size="sm"
                        className="mt-3 w-full text-xs font-semibold rounded-lg"
                      >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        Add to Cart
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
              {/* Row: Brand */}
              <tr>
                <td className="p-4 font-semibold text-zinc-500 bg-zinc-50/30">Brand</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-zinc-900">
                    {p.brand}
                  </td>
                ))}
              </tr>

              {/* Row: Rating */}
              <tr>
                <td className="p-4 font-semibold text-zinc-500 bg-zinc-50/30">Customer Rating</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="flex items-center gap-1 font-semibold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-zinc-900">{p.rating.toFixed(1)}</span>
                      <span className="text-zinc-400 font-normal">({p.reviewCount} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Stock */}
              <tr>
                <td className="p-4 font-semibold text-zinc-500 bg-zinc-50/30">Availability</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4">
                    <StockBadge quantity={p.inventoryQuantity ?? 10} />
                  </td>
                ))}
              </tr>

              {/* Row: Best Value Evaluation */}
              <tr className="bg-blue-50/30">
                <td className="p-4 font-bold text-blue-900">AI Value Assessment</td>
                {comparedProducts.map((p) => {
                  const minPrice = Math.min(...comparedProducts.map((cp) => cp.basePrice));
                  const maxRating = Math.max(...comparedProducts.map((cp) => cp.rating));
                  const isBestValue = p.basePrice === minPrice;
                  const isTopRated = p.rating === maxRating;

                  return (
                    <td key={p.id} className="p-4">
                      {isBestValue && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3" />
                          Lowest Price in Group
                        </span>
                      )}
                      {isTopRated && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 mt-1 block w-fit">
                          ★ Highest Rated Option
                        </span>
                      )}
                      {!isBestValue && !isTopRated && (
                        <span className="text-zinc-500 text-[11px]">Balanced Feature Set</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm">Loading comparison matrix...</div>}>
      <CompareContent />
    </Suspense>
  );
}
