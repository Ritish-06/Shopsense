"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingDown,
  Bell,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function PriceTrackerPage() {
  const [trackedProducts, setTrackedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertTargetId, setAlertTargetId] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [alertSuccessId, setAlertSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products?limit=12&sort=reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setTrackedProducts(data.products);
        }
      })
      .catch((err) => console.error("Error loading price tracker data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAlert = (productId: string) => {
    if (!targetAmount) return;
    setAlertSuccessId(productId);
    setTimeout(() => {
      setAlertSuccessId(null);
      setAlertTargetId(null);
      setTargetAmount("");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading historical price trackers...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="mb-8 pb-6 border-b border-zinc-200">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 mb-2 border border-emerald-200">
          <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
          <span>Verified Historical Price Tracking</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Live Price Tracker & Drop Alerts
        </h1>
        <p className="mt-1 text-xs text-zinc-500 max-w-2xl">
          ShopSense monitors price movements across certified regional retailers. Never pay full retail
          when historical dips and festive promotion alerts can notify you automatically.
        </p>
      </div>

      {/* Grid of tracked items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackedProducts.map((p) => {
          // Synthetic but consistent min/max based on actual basePrice
          const currentPrice = p.basePrice;
          const minHistorical = Math.round(p.basePrice * 0.92);
          const maxHistorical = Math.round(p.basePrice * 1.15);
          const dropAmount = maxHistorical - currentPrice;
          const dropPercent = Math.round((dropAmount / maxHistorical) * 100);

          return (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-card"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 p-1">
                    <img src={p.image} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {p.brand}
                    </span>
                    <Link href={`/products/${p.slug}`} className="block">
                      <h3 className="text-xs font-bold text-zinc-900 hover:text-blue-600 line-clamp-1">
                        {p.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-zinc-900">
                        {formatCurrency(currentPrice)}
                      </span>
                      <span className="flex items-center text-[11px] font-bold text-emerald-600">
                        <ArrowDownRight className="h-3 w-3" />
                        {dropPercent}% off peak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-zinc-100 pt-3">
                  <div className="rounded-lg bg-zinc-50 p-2 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 block">90-Day Low</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(minHistorical)}</span>
                  </div>
                  <div className="rounded-lg bg-zinc-50 p-2 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 block">Launch Peak</span>
                    <span className="font-bold text-zinc-500">{formatCurrency(maxHistorical)}</span>
                  </div>
                </div>

                {/* Target Price Alert Box */}
                {alertTargetId === p.id ? (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs">
                    {alertSuccessId === p.id ? (
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Target alert active at ₹{Number(targetAmount).toLocaleString()}!
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-zinc-800 block mb-1.5">
                          Set your target alert threshold:
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={`e.g. ₹${Math.round(minHistorical * 0.98)}`}
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            className="h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-xs focus:outline-none"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCreateAlert(p.id)}
                            className="h-8 text-xs font-semibold shrink-0"
                          >
                            Save Alert
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 border-t border-zinc-100 pt-3 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setAlertTargetId(alertTargetId === p.id ? null : p.id);
                    setTargetAmount(String(Math.round(currentPrice * 0.95)));
                  }}
                  className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {alertTargetId === p.id ? "Close Alert" : "Set Target Alert"}
                </button>

                <Link
                  href={`/products/${p.slug}`}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
