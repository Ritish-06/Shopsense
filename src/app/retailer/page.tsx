"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Package,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RetailerOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/retailer/overview")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error loading retailer overview:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500">Loading retailer analytics...</div>;
  }

  const kpis = data?.kpis || {};
  const chartData = data?.chartData || [];
  const recentOrders = data?.recentOrders || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Executive Retail Overview</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time performance metrics, inventory health, and revenue analytics for Apex Tech Direct.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/retailer/assistant">
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI Analyst
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="30-Day Gross Revenue"
          value={formatCurrency(kpis.grossSales || 0)}
          change={kpis.revenueChangePercentage}
          changeLabel="vs previous 30 days"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Units Sold"
          value={kpis.totalUnitsSold || 0}
          change={kpis.unitsChangePercentage}
          changeLabel="vs previous 30 days"
          icon={Package}
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(kpis.averageOrderValue || 0)}
          subtitle="Net AOV"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Gross Margin"
          value={`${kpis.grossMarginPercentage || 0}%`}
          subtitle={`Gross Profit: ${formatCurrency(kpis.grossProfit || 0)}`}
          variant="success"
          icon={TrendingUp}
        />
      </div>

      {/* Low Stock Warning Banner if items <= 15 */}
      {lowStockAlerts.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-orange-950">
                  {lowStockAlerts.length} Products Approaching Reorder Points
                </h3>
                <p className="text-xs text-orange-800 mt-0.5">
                  The following items have dipped below safety stock thresholds. Review velocity to avoid stockouts.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {lowStockAlerts.map((item: any) => (
                    <span
                      key={item.productId}
                      className="rounded-md bg-white border border-orange-200 px-2.5 py-1 text-zinc-800 font-medium"
                    >
                      {item.title}: <strong className="text-orange-700">{item.quantity} left</strong> (Reorder point: {item.reorderPoint})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/retailer/inventory">
              <Button size="sm" variant="outline" className="border-orange-300 text-xs shrink-0">
                Replenish Stock
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Charts & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 14-Day Sales & Profit Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">14-Day Daily Revenue & Profit Trend</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Daily aggregated sales transactions from verified orders.</p>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              Daily Aggregate
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val)),
                    name === "revenue" ? "Revenue" : "Gross Profit",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Orders (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Recent Store Orders</h3>
              <Link href="/retailer/sales" className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="text-xs border-b border-zinc-50 pb-2.5 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{order.orderNumber}</span>
                    <span className="font-extrabold text-zinc-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500 mt-1">
                    <span className="line-clamp-1 max-w-[150px]">{order.firstItem}</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <Link href="/retailer/inventory/forecast" className="block">
              <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-xs text-blue-900 flex items-center justify-between hover:bg-blue-100/70 transition">
                <div>
                  <span className="font-bold block">Next Reorder Forecast</span>
                  <span className="text-[11px] text-blue-700">Predict demand for next 14 days</span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
