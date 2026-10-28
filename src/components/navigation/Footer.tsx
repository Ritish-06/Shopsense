import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu, RefreshCw, BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      {/* Platform Value Highlights */}
      <div className="border-b border-zinc-100 bg-[#FAFAF9] py-8">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">AI Shopping Advisor</h4>
              <p className="mt-1 text-xs text-zinc-500">
                Evidence-grounded catalog matching with zero hallucinations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Real-Time Inventory</h4>
              <p className="mt-1 text-xs text-zinc-500">
                Atomic transactions with live stock reservation and concurrency protection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Demand Forecasting</h4>
              <p className="mt-1 text-xs text-zinc-500">
                Moving average & exponential smoothing models for proactive restocking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Multi-Tenant Isolation</h4>
              <p className="mt-1 text-xs text-zinc-500">
                Cryptographically enforced boundaries between retailers and customers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">
                Shop<span className="text-blue-600">Sense</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-xs text-zinc-500 leading-relaxed">
              ShopSense bridges customer shopping intelligence with small and medium retailer analytics.
              Built with Next.js 15, Prisma ORM, and explainable AI algorithms.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
              <span>© {new Date().getFullYear()} ShopSense Platform Inc.</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Customer</h5>
            <ul className="mt-3 space-y-2 text-xs text-zinc-500">
              <li>
                <Link href="/products" className="hover:text-blue-600">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-blue-600">
                  AI Product Advisor
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-blue-600">
                  Product Comparison
                </Link>
              </li>
              <li>
                <Link href="/price-tracker" className="hover:text-blue-600">
                  Price Tracker & Alerts
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-blue-600">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Retailers</h5>
            <ul className="mt-3 space-y-2 text-xs text-zinc-500">
              <li>
                <Link href="/retailer" className="hover:text-blue-600">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link href="/retailer/inventory" className="hover:text-blue-600">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link href="/retailer/inventory/forecast" className="hover:text-blue-600">
                  Demand Forecasting
                </Link>
              </li>
              <li>
                <Link href="/retailer/sales" className="hover:text-blue-600">
                  Sales Analytics
                </Link>
              </li>
              <li>
                <Link href="/retailer/assistant" className="hover:text-blue-600">
                  AI Business Analyst
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Platform</h5>
            <ul className="mt-3 space-y-2 text-xs text-zinc-500">
              <li>
                <Link href="/admin" className="hover:text-blue-600">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600">
                  Architecture & Docs
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Systems Operational
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
