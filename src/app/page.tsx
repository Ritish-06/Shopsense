"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  Star,
  Check,
  Sliders,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  "laptops-computing": Laptop,
  "smartphones-tablets": Smartphone,
  "audio-headphones": Headphones,
  "smart-home-iot": Home,
  "wearables-fitness": Watch,
  "cameras-gear": Camera,
};

const SUGGESTED_INQUIRIES = [
  { label: "💻 Laptops for programming", query: "Laptop under $2000 for programming" },
  { label: "🎧 Headphones for work", query: "Noise cancelling headphones for work" },
  { label: "📱 Flagship camera phone", query: "Flagship smartphone with best camera" },
  { label: "⌚ Smartwatch for fitness", query: "Smartwatch with health and GPS tracking" },
];

export default function HomePage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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

  const handleChipClick = (queryText: string) => {
    setAiPrompt(queryText);
    router.push(`/assistant?q=${encodeURIComponent(queryText)}`);
  };

  const heroWords = ["Shopping,", "Reimagined", "with", "Intelligence."];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-[#FCFBF8] to-[#FAF9F6] pt-14 pb-16 md:pt-20 md:pb-24">
        {/* Subtle geometric background blur */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-100/40 via-emerald-50/30 to-amber-50/20 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Badge */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-subtle backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Zero-Hallucination AI E-Commerce & Retail Intelligence</span>
              </motion.div>

              {/* Headline with word-by-word reveal */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
                {heroWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: shouldReduceMotion ? 0 : 0.08 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`inline-block mr-2.5 ${
                      word === "Intelligence."
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600"
                        : ""
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              {/* Supporting Copy */}
              <motion.p
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.35 }}
                className="text-base sm:text-lg text-zinc-600 max-w-xl leading-relaxed font-normal"
              >
                Discover products you’ll love, compare prices intelligently, and make confident buying
                decisions with AI-powered shopping intelligence.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.45 }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Link href="/products">
                  <Button size="lg" className="rounded-xl px-7 text-sm font-semibold shadow-md group">
                    <span>Explore Products</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/assistant">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl px-6 text-sm font-semibold border-zinc-300 text-zinc-800 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                    <span>Try AI Shopping Assistant</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>100% Authoritative Pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>90-Day Price Trajectory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Zero Phantom SKUs</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Centerpiece (5 cols) */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl border border-zinc-200/90 bg-white/90 p-5 shadow-elevated backdrop-blur-xl">
                {/* Visual Glassmorphic Showcase */}
                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-mono">
                      Live Market Telemetry
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    Precision@3: 1.000
                  </span>
                </div>

                {/* Hero Showcase Card */}
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/70 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        Top Rated Recommendation
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 mt-0.5">
                        MacBook Pro 14&quot; (M3 Pro)
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">18GB Unified Memory • 512GB SSD</p>
                    </div>
                    <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-bold text-emerald-700">
                      $1,999
                    </span>
                  </div>

                  {/* 90-Day Sparkline representation */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                      <span>90-Day Trajectory</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <TrendingDown className="h-3 w-3" />
                        All-Time Low: $1,849
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex items-center">
                      <div className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 rounded-full w-[85%]" />
                    </div>
                  </div>

                  {/* Sentiment Consensus Pills */}
                  <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-medium text-zinc-600">
                    <span className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 shadow-2xs">
                      ⚡ Performance: 96% Pos
                    </span>
                    <span className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 shadow-2xs">
                      🔋 Battery: 94% Pos
                    </span>
                    <span className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 shadow-2xs">
                      🖥️ Liquid Retina XDR
                    </span>
                  </div>
                </div>

                {/* Floating Metric Pill 1 */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-zinc-100 bg-[#FAF9F6] p-3 text-left">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Stock Status
                    </span>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5">Verified In Stock</p>
                    <span className="text-[10px] text-zinc-400">Atomic Checkout Safe</span>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-[#FAF9F6] p-3 text-left">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Daily Sales Velocity
                    </span>
                    <p className="font-bold text-zinc-900 text-sm mt-0.5">3.4 Units / Day</p>
                    <span className="text-[10px] text-blue-600 font-medium">Demand Forecasted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT INTERACTIVE AI DISCOVERY PANEL */}
      <section className="py-12 border-b border-zinc-200/80 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Product Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">
              What are you looking for today?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Describe your budget, workflow, or specifications in plain English.
            </p>
          </div>

          <form
            onSubmit={handleAiSearch}
            className={`relative rounded-2xl border transition-all duration-300 bg-[#FAF9F6] p-2.5 shadow-card ${
              isSearchFocused
                ? "border-blue-600 ring-4 ring-blue-100/70 bg-white"
                : "border-zinc-300 hover:border-zinc-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 ml-1 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>

              <input
                type="text"
                value={aiPrompt}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Find me the perfect product for my needs (e.g. 'Laptop under $2000 for coding')..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />

              <Button type="submit" size="sm" className="shrink-0 rounded-xl px-5 font-semibold text-xs h-10">
                <span>Advise Me</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </form>

          {/* Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-zinc-400 mr-1">Quick Suggestions:</span>
            {SUGGESTED_INQUIRIES.map((chip, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(chip.query)}
                className="rounded-full border border-zinc-200/90 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-2xs hover:border-blue-500 hover:text-blue-600 transition-all duration-200 active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES GRID */}
      <section className="py-14 border-b border-zinc-200/80 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Explore Catalog by Category</h2>
              <p className="text-xs text-zinc-500 mt-1">Verified catalog from certified regional tech retailers</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Laptop;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700 transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="mt-1 text-[11px] text-zinc-400">{cat.productCount} products</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. RECOMMENDED PRODUCTS WITH REDESIGNED CARDS */}
      <section className="py-16 bg-white border-b border-zinc-200/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
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

      {/* 5. SPEC COMPARISON & PRICE TRACKING SPOTLIGHT */}
      <section className="py-16 bg-[#FAFAF9] border-b border-zinc-200/80">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Spotlight A: 4-Way Spec Comparison */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-5">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">4-Way Side-by-Side Spec Comparison</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Evaluate CPUs, GPUs, RAM configurations, display refresh rates, and battery watt-hours
                  without flipping between dozens of open browser tabs.
                </p>

                <div className="mt-5 rounded-2xl bg-[#FAF9F6] border border-zinc-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-900 border-b border-zinc-200 pb-2">
                    <span>Feature Metric</span>
                    <span>AI Value Assessment</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Geekbench 6 Multi-Core</span>
                    <span className="font-semibold text-emerald-700">+38% Lead (Apple M3 Pro)</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Peak Nits Brightness</span>
                    <span className="font-semibold text-zinc-800">1,600 nits (Mini-LED)</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Price-to-Performance</span>
                    <span className="font-bold text-blue-600">Grade A+ (Verified)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <Link
                  href="/compare"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                >
                  Launch Side-by-Side Comparison Matrix <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Spotlight B: 90-Day Historical Price Tracker */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-5">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">90-Day Price Trajectory & Alerts</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Know exactly whether you are paying launch price or catching an authentic seasonal dip.
                  Set target price thresholds and receive instant alerts when items drop.
                </p>

                <div className="mt-5 rounded-2xl bg-[#FAF9F6] border border-zinc-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-zinc-900 border-b border-zinc-200 pb-2">
                    <span>Historical Telemetry</span>
                    <span>Current Signal</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Launch Peak Price</span>
                    <span className="font-semibold text-zinc-800">$2,199 (90 days ago)</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Verified Discount</span>
                    <span className="font-semibold text-emerald-700">-$200 (-9.1% True Price Drop)</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Purchase Timing Recommendation</span>
                    <span className="font-bold text-emerald-700">Strong Buy (Near 90-day Low)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <Link
                  href="/price-tracker"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                >
                  Explore Price Trajectory Engine <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RETAILER INTELLIGENCE PORTAL SHOWCASE */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  For Verified Tech Retailers
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 leading-snug">
                  Predict demand. Automate reorders. Prevent stockouts.
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  ShopSense empowers electronics retailers with enterprise-grade sales velocity analytics,
                  single exponential smoothing (α=0.3) demand forecasting, and an AI Business Analyst with
                  complete mathematical transparency.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Sales Velocity</span>
                    <strong className="text-zinc-900 text-sm">Units / Day Tracking</strong>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Forecasting</span>
                    <strong className="text-zinc-900 text-sm">α=0.3 Smoothing</strong>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Safety</span>
                    <strong className="text-zinc-900 text-sm">Atomic Stock Decrements</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/retailer">
                    <Button size="lg" className="rounded-xl px-7 text-sm font-semibold">
                      Launch Retailer Command Center
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-800">Apex Tech Direct (Demo)</span>
                  <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
                    Gross Margin: 24.8%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-500">14-Day Revenue</span>
                    <span className="font-bold text-zinc-900">$184,250</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-500">30-Day Orders</span>
                    <span className="font-bold text-zinc-900">642 Verified</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-500">Reorder Alert Status</span>
                    <span className="font-bold text-emerald-600">0 Critical Stockouts</span>
                  </div>
                </div>
                <Link
                  href="/retailer/assistant"
                  className="block text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  Ask AI Business Analyst →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
