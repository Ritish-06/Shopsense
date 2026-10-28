"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Cpu,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DemandForecastPage() {
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [modelType, setModelType] = useState<"EXPONENTIAL_SMOOTHING" | "MOVING_AVERAGE">("EXPONENTIAL_SMOOTHING");
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = (prodId?: string, horizon?: number, model?: string) => {
    setLoading(true);
    const pid = prodId || selectedProductId;
    const h = horizon || horizonDays;
    const m = model || modelType;

    const url = `/api/retailer/forecast?${pid ? `productId=${pid}&` : ""}horizonDays=${h}&model=${m}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.availableProducts) {
          setAvailableProducts(data.availableProducts);
          if (!selectedProductId && data.availableProducts.length > 0) {
            setSelectedProductId(data.availableProducts[0].id);
          }
        }
        if (data.forecast) {
          setForecastData(data.forecast);
        }
      })
      .catch((err) => console.error("Error loading forecast:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleProductChange = (newPid: string) => {
    setSelectedProductId(newPid);
    fetchForecast(newPid, horizonDays, modelType);
  };

  const handleHorizonChange = (h: number) => {
    setHorizonDays(h);
    fetchForecast(selectedProductId, h, modelType);
  };

  const handleModelChange = (m: "EXPONENTIAL_SMOOTHING" | "MOVING_AVERAGE") => {
    setModelType(m);
    fetchForecast(selectedProductId, horizonDays, m);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 mb-1 border border-blue-200">
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>Time-Series Demand Modeling</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Predictive Demand Forecasting
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Evaluate future product sales velocity to optimize purchase orders and eliminate stockouts.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModelChange("EXPONENTIAL_SMOOTHING")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              modelType === "EXPONENTIAL_SMOOTHING"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Exponential Smoothing (α=0.3)
          </button>
          <button
            onClick={() => handleModelChange("MOVING_AVERAGE")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              modelType === "MOVING_AVERAGE"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            7-Day Moving Average
          </button>
        </div>
      </div>

      {/* Selectors Bar: Product & Horizon */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider shrink-0">
            Target Product:
          </span>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="h-9 w-full sm:w-80 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none"
          >
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} - {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-zinc-500">Forecast Horizon:</span>
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => handleHorizonChange(days)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                horizonDays === days
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">
          Calculating time-series projections and confidence intervals...
        </div>
      ) : forecastData ? (
        <div className="space-y-6">
          {/* Top Recommendation & Evaluation Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                Suggested Reorder Quantity
              </span>
              <p className="text-2xl font-black text-blue-950 mt-1">
                +{forecastData.suggestedReorderUnits} units
              </p>
              <span className="text-[10px] text-blue-700 mt-0.5 block">
                Covers predicted demand + 5 safety stock units
              </span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Model Error (MAE)
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                ±{forecastData.mae} units/day
              </p>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">
                Chronological 80/20 train/test evaluation
              </span>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Active Architecture
              </span>
              <p className="text-lg font-bold text-zinc-900 mt-1">
                {forecastData.modelUsed.replace("_", " ")}
              </p>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                Trained on 180-day sales time-series
              </span>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {forecastData.productTitle} — Demand Trajectory & Bounds
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Solid blue line indicates expected demand. Shaded area indicates lower and upper bounds.
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData.forecastPoints}>
                  <defs>
                    <linearGradient id="boundsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} units`,
                      name === "predictedUnits"
                        ? "Expected Demand"
                        : name === "upperBound"
                        ? "Upper Bound (+2σ)"
                        : "Lower Bound (-2σ)",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#93c5fd"
                    strokeDasharray="2 2"
                    fill="url(#boundsColor)"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#93c5fd"
                    strokeDasharray="2 2"
                    fill="transparent"
                    name="Lower Bound"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedUnits"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#2563eb" }}
                    name="Expected Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Assumptions & Disclaimer Banner */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs text-zinc-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800">
              <Info className="h-4 w-4 text-blue-600" />
              <span>Assumptions & Operational Limitations:</span>
            </div>
            <p>
              1. <strong>Estimates, Not Guarantees:</strong> Projections represent statistical extrapolations
              from historical daily demand. Unexpected market shocks or competitor stockouts are not modeled.
            </p>
            <p>
              2. <strong>Zero Data Leakage:</strong> Training and evaluation strictly obey chronological order.
              Future test data is never leaked into training weights.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
