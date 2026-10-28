"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  BarChart2,
  CheckCircle2,
  Search,
  Laptop,
  Smartphone,
  Headphones,
  Home,
  Watch,
  Camera,
} from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";

const categoryIcons: Record<string, any> = {
  "laptops-computing": Laptop,
  "smartphones-tablets": Smartphone,
  "audio-headphones": Headphones,
  "smart-home-iot": Home,
  "wearables-fitness": Watch,
  "cameras-gear": Camera,
};

export default function HomePage() {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=8&sort=rating").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        if (productsData.products) setFeaturedProducts(productsData.products);
        if (categoriesData.categories) setCategories(categoriesData.categories);
      })
      .catch((err) => console.error("Error loading homepage data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      router.push(`/assistant?q=${encodeURIComponent(aiPrompt.trim())}`);
    } else {
      router.push("/assistant");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI E-Commerce Intelligence & Retail Analytics Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
            Shop Smarter. Sell Better.{" "}
            <span className="text-blue-600">Understand More.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Discover verified tech products with zero AI hallucinations. Connect shopper requirements
            with predictive inventory, review aspect insights, and sales velocity intelligence.
          </p>

          {/* AI Advisor Prompt Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleAiSearch}
              className="relative flex items-center rounded-2xl border border-zinc-300 bg-white p-2 shadow-elevated transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 ml-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI: e.g. 'Laptop under ₹70,000 for coding and travel'..."
                className="w-full bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <Button type="submit" size="sm" className="shrink-0 rounded-xl px-5">
                <span>Advise Me</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
              <span className="font-medium text-zinc-400">Popular AI inquiries:</span>
              <button
                onClick={() => {
                  setAiPrompt("Best noise cancelling headphones for flights");
                  router.push(`/assistant?q=${encodeURIComponent("Best noise cancelling headphones for flights")}`);
                }}
                className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600 hover:border-blue-400 hover:text-blue-600 transition"
              >
                🎧 Best ANC headphones for flights
              </button>
              <button
                onClick={() => {
                  setAiPrompt("Lightweight laptop under ₹60,000");
                  router.push(`/assistant?q=${encodeURIComponent("Lightweight laptop under ₹60,000")}`);
                }}
                className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600 hover:border-blue-400 hover:text-blue-600 transition"
              >
                💻 Lightweight laptop under ₹60k
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 border-b border-zinc-200/80 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Explore Catalog by Category</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Verified catalog from certified regional retailers</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Laptop;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center justify-center rounded-xl border border-zinc-200/80 bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-xs font-semibold text-zinc-900 group-hover:text-blue-600">
                    {cat.name}
                  </h3>
                  <span className="mt-1 text-[11px] text-zinc-400">{cat.productCount} products</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Intelligence Products */}
      <section className="py-14 bg-white border-b border-zinc-200/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200 mb-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Live Catalog Synced
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Highest Rated Tech Selections</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ranked by customer sentiment score, verified purchase ratio, and performance benchmarks.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse 100+ Products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Intelligence Pillars */}
      <section className="py-16 bg-[#FAFAF9] border-b border-zinc-200/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              Beyond Basic E-Commerce
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              ShopSense connects customer shopping intelligence with real-world retailer operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar A */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-sm transition hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">1. Shopping Intelligence</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Natural-language advice grounded strictly in database records. Aspect-level sentiment
                extraction (battery life, display, durability) from real customer reviews.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Zero LLM price or spec fabrication
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Side-by-side 4-way spec comparison
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Historical price tracking & alerts
                </li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/assistant"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Try AI Shopping Advisor <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar B */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-sm transition hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-5">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">2. Retail Intelligence</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Small and medium retailers gain actionable intelligence on sales velocity, gross margins,
                days of stock remaining, and CSV sales batch imports.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Daily velocity & days of stock remaining
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Moving average & exp smoothing forecasts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  AI Business Analyst with scoped queries
                </li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/retailer"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  Explore Retailer Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar C */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 shadow-sm transition hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">3. Operational Integrity</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                Transactional checkout prevents race conditions and overselling. Auditable inventory
                movement ledgers ensure stock changes can be reconciled.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Concurrency-safe stock transactions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Automatic low-stock threshold triggers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Cryptographic multi-tenant separation
                </li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/retailer/inventory"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View Inventory Operations <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Retailer Partners Showcase */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Are you a Tech Retailer?
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                Take control of stockouts, velocity, and future demand.
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Stop managing inventory on disconnected spreadsheets. Use ShopSense&apos;s demand forecasting
                and AI business analyst to optimize supplier reorder cycles.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/retailer">
                <Button size="lg" className="rounded-xl px-6">
                  Launch Retailer Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
