"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  Sparkles,
  ArrowRightLeft,
  TrendingDown,
  LayoutDashboard,
  User,
  Menu,
  X,
} from "lucide-react";
import { PersonaSwitcher } from "../ui/PersonaSwitcher";

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync search input on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setSearchQuery(q);
    }
  }, []);

  // Fetch cart count
  const refreshCart = () => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        if (data.cart?.items) {
          const total = data.cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setCartCount(total);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshCart();
    // Poll cart changes or listen to storage/focus events
    window.addEventListener("focus", refreshCart);
    return () => window.removeEventListener("focus", refreshCart);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      {/* Top Banner with Platform Value Proposition & Persona Switcher */}
      <div className="border-b border-zinc-100 bg-[#FAFAF9] px-4 py-1.5 text-xs text-zinc-600 sm:px-6">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-zinc-700">ShopSense Real-Time Intelligence Platform</span>
            <span className="hidden md:inline text-zinc-400">• Shop Smarter. Sell Better. Understand More.</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/retailer"
              className="hidden sm:flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Retailer Portal
            </Link>
            <div className="h-3 w-px bg-zinc-300 hidden sm:block" />
            <PersonaSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
              Shop<span className="text-blue-600">Sense</span>
            </span>
            <span className="text-[10px] font-medium text-zinc-500 tracking-wider uppercase">
              Retail & AI Intelligence
            </span>
          </div>
        </Link>

        {/* Search Bar with instant submission */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden md:flex flex-1 max-w-md items-center"
        >
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, specs (e.g. OLED, M3, 16GB)..."
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50/80 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </form>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-zinc-600">
          <Link href="/products" className="transition hover:text-blue-600">
            Catalog
          </Link>
          <Link href="/compare" className="flex items-center gap-1 transition hover:text-blue-600">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Compare
          </Link>
          <Link href="/price-tracker" className="flex items-center gap-1 transition hover:text-blue-600">
            <TrendingDown className="h-3.5 w-3.5" />
            Price Tracker
          </Link>
          <Link
            href="/assistant"
            className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            AI Advisor
          </Link>
        </nav>

        {/* Customer Actions: Wishlist, Cart, Orders */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100"
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </Link>

          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100"
            title="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100"
            title="Order History"
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white p-4 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm focus:outline-none"
            />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium text-zinc-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 hover:bg-zinc-100"
            >
              All Products Catalog
            </Link>
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 font-semibold text-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              AI Product Advisor
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 hover:bg-zinc-100"
            >
              Product Comparison
            </Link>
            <Link
              href="/price-tracker"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 hover:bg-zinc-100"
            >
              Price Tracker & Alerts
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 hover:bg-zinc-100"
            >
              My Orders
            </Link>
            <Link
              href="/retailer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border border-blue-200 p-2 text-blue-600 hover:bg-blue-50"
            >
              Retailer Intelligence Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
