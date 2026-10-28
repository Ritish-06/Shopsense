"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  LineChart,
  TrendingUp,
  Bot,
  Truck,
  Bell,
  Settings,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/retailer", icon: LayoutDashboard },
  { label: "Products", href: "/retailer/products", icon: Package },
  { label: "Inventory Control", href: "/retailer/inventory", icon: Boxes },
  { label: "Demand Forecasting", href: "/retailer/inventory/forecast", icon: TrendingUp },
  { label: "Sales & CSV Import", href: "/retailer/sales", icon: LineChart },
  { label: "AI Business Analyst", href: "/retailer/assistant", icon: Bot, highlight: true },
  { label: "Suppliers & Lead Times", href: "/retailer/suppliers", icon: Truck },
  { label: "Alerts & Health", href: "/retailer/alerts", icon: Bell },
  { label: "Settings", href: "/retailer/settings", icon: Settings },
];

export default function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-50/60">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Store Info Banner */}
          <div className="p-5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                AT
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold text-zinc-900 leading-none">Apex Tech Direct</h3>
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">Authorized Retailer #8012</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    item.highlight && !isActive && "text-blue-600 bg-blue-50/50 hover:bg-blue-100/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", isActive ? "text-white" : item.highlight ? "text-blue-600" : "text-zinc-500")} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher & Storefront link */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Customer Storefront
          </Link>
        </div>
      </aside>

      {/* Main Retailer Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live Inventory Sync Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/retailer/sales"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition"
            >
              <Upload className="h-3.5 w-3.5 text-zinc-500" />
              Import Sales CSV
            </Link>

            <Link
              href="/retailer/assistant"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI Business Analyst
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
