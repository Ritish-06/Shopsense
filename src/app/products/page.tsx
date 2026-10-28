"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Package,
} from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "featured";

  const [localSearch, setLocalSearch] = useState(q);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available brands in tech catalog
  const popularBrands = [
    "Apple",
    "Samsung",
    "Sony",
    "Dell",
    "Lenovo",
    "ASUS",
    "Bose",
    "Logitech",
    "DJI",
    "Google",
  ];

  // Fetch products whenever filters in URL change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", "24");

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          setTotalCount(data.pagination?.total ?? data.products.length);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice: localMin || null, maxPrice: localMax || null });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setLocalMin("");
    setLocalMax("");
    router.push("/products");
  };

  const hasActiveFilters = Boolean(q || category || brand || minPrice || maxPrice || inStock);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header and Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Tech Product Catalog</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {products.length} of {totalCount} verified items across certified retailers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 md:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters {hasActiveFilters && "•"}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="featured">Featured / Relevant</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Results */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Active Filters</span>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {q && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-xs text-zinc-700">
                    &quot;{q}&quot;
                    <X className="h-3 w-3 cursor-pointer text-zinc-400 hover:text-zinc-700" onClick={() => updateFilters({ q: null })} />
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-800">
                    {categories.find((c) => c.slug === category)?.name || category}
                    <X className="h-3 w-3 cursor-pointer text-blue-400 hover:text-blue-700" onClick={() => updateFilters({ category: null })} />
                  </span>
                )}
                {brand && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-xs text-zinc-800">
                    {brand}
                    <X className="h-3 w-3 cursor-pointer text-zinc-400 hover:text-zinc-700" onClick={() => updateFilters({ brand: null })} />
                  </span>
                )}
                {inStock && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-800">
                    In Stock Only
                    <X className="h-3 w-3 cursor-pointer text-emerald-400 hover:text-emerald-700" onClick={() => updateFilters({ inStock: null })} />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Search Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2.5">Keyword Search</h4>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") updateFilters({ q: localSearch || null });
                }}
                placeholder="Search specs, models..."
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2.5">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ category: null })}
                className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                  !category ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug })}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    category === cat.slug ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] ${category === cat.slug ? "text-blue-100" : "text-zinc-400"}`}>
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2.5">Availability</h4>
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : null })}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <span>In Stock Only (Exclude Sold Out)</span>
            </label>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2.5">Price Range (₹)</h4>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                Apply Price
              </Button>
            </form>
          </div>

          {/* Brands Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2.5">Popular Brands</h4>
            <div className="flex flex-wrap gap-1.5">
              {popularBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => updateFilters({ brand: brand === b ? null : b })}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    brand === b
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products match your criteria"
              description="Try adjusting your keywords, widening the price filter, or checking for other categories."
              actionLabel="Clear Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
