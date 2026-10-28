"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ScrollText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error loading admin data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500">Loading administrative telemetry...</div>;
  }

  const metrics = data?.metrics || {};
  const retailers = data?.retailers || [];
  const logs = data?.recentLogs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Platform Operations & Governance
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Root oversight over authenticated retailers, catalog moderations, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform Healthy • Database In Sync
          </span>
        </div>
      </div>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Users"
          value={metrics.totalUsers || 0}
          subtitle="Customers, Retailers & Admins"
          icon={Users}
        />
        <MetricCard
          title="Authorized Retailers"
          value={metrics.totalRetailers || 0}
          subtitle="100% Verified Stores"
          icon={Store}
          variant="success"
        />
        <MetricCard
          title="Active Catalog SKUs"
          value={metrics.totalProducts || 0}
          subtitle="Across 6 Hardware Categories"
          icon={Package}
        />
        <MetricCard
          title="Processed Orders"
          value={metrics.totalOrders || 0}
          subtitle="Transactional settlements"
          icon={ShoppingCart}
        />
      </div>

      {/* Retailers Oversight Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Registered Tech Retailers</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Multi-tenant merchants operating on ShopSense.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-3">Store Name</th>
                <th className="p-3">Store Slug</th>
                <th className="p-3">Contact Email</th>
                <th className="p-3">Active SKUs</th>
                <th className="p-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {retailers.map((r: any) => (
                <tr key={r.id}>
                  <td className="p-3 font-bold text-zinc-900">{r.storeName}</td>
                  <td className="p-3 font-mono text-zinc-500">{r.storeSlug}</td>
                  <td className="p-3 text-zinc-500">{r.contactEmail}</td>
                  <td className="p-3 font-semibold">{r.inventoryCount} SKUs</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Merchant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-bold text-zinc-900">Security Audit Trail</h3>
          </div>
          <span className="text-[11px] text-zinc-400">Immutable operations ledger</span>
        </div>

        <div className="space-y-2.5">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-xs border border-zinc-100"
            >
              <div className="flex items-center gap-3">
                <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-800">
                  {log.action}
                </span>
                <span className="font-semibold text-zinc-900">{log.entityType}</span>
                <span className="text-zinc-500 truncate max-w-sm">{log.details}</span>
              </div>
              <div className="text-right text-zinc-400 text-[11px]">
                <span>{log.userName}</span> • <span>{formatDate(log.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
