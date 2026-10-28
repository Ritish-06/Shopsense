"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function RetailerAlertsPage() {
  const [alertsData, setAlertsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/retailer/alerts")
      .then((res) => res.json())
      .then((d) => setAlertsData(d))
      .catch((err) => console.error("Error loading alerts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500">Loading alerts and insights...</div>;
  }

  const insights = alertsData?.insights || [];
  const notifications = alertsData?.notifications || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Operational Alerts & Insights
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time stock threshold breaches, forecast warnings, and platform event logs.
          </p>
        </div>
      </div>

      {/* Business Intelligence Insights */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-orange-600" />
          Proactive Business Recommendations ({insights.length})
        </h2>

        {insights.map((item: any) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 text-xs shadow-sm transition ${
              item.severity === "CRITICAL"
                ? "border-red-200 bg-red-50/40"
                : "border-orange-200 bg-orange-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      item.severity === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {item.severity}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-900">{item.title}</h3>
                </div>
                <p className="text-zinc-700 leading-relaxed">{item.summary}</p>
                <div className="rounded-lg bg-white p-3 border border-zinc-200/60 text-zinc-800 font-medium">
                  <strong>Recommended Action:</strong> {item.recommendation}
                </div>
              </div>

              <Link href="/retailer/inventory">
                <Button size="sm" variant="outline" className="text-xs shrink-0">
                  Manage Stock
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* System Notifications */}
      <div className="space-y-3 pt-6 border-t border-zinc-200">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-blue-600" />
          Event Notifications ({notifications.length})
        </h2>

        {notifications.map((n: any) => (
          <div
            key={n.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 text-xs flex items-center justify-between gap-4"
          >
            <div>
              <h4 className="font-semibold text-zinc-900">{n.title}</h4>
              <p className="text-zinc-500 mt-0.5">{n.message}</p>
              <span className="text-[10px] text-zinc-400 mt-1 block">{formatDate(n.createdAt)}</span>
            </div>
            {n.link && (
              <Link href={n.link}>
                <Button size="sm" variant="ghost" className="text-xs">
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
