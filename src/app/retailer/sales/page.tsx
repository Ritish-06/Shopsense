"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RetailerSalesPage() {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "csvImport">("analytics");

  // CSV upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  const fetchSales = () => {
    fetch("/api/retailer/sales?days=30")
      .then((res) => res.json())
      .then((d) => setSalesData(d))
      .catch((err) => console.error("Error loading sales:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadPreview(null);
    setCommitMessage(null);
    setIsValidating(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("commit", "false");

    try {
      const res = await fetch("/api/retailer/sales", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadPreview(data);
      } else {
        alert(data.error || "CSV validation error");
      }
    } catch {
      alert("Failed to upload and validate CSV");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommitImport = async () => {
    if (!file) return;
    setIsCommitting(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("commit", "true");

    try {
      const res = await fetch("/api/retailer/sales", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCommitMessage(data.message);
        setUploadPreview(null);
        setFile(null);
        fetchSales();
      } else {
        alert(data.error || "Failed to commit import");
      }
    } catch {
      alert("Failed to commit CSV data");
    } finally {
      setIsCommitting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      "date,sku,product_name,units_sold,unit_price,unit_cost\n" +
      "2026-10-25,SKU-1001-MACBOOK,MacBook Pro 14 M3 Pro,2,199900,165000\n" +
      "2026-10-26,SKU-1002-DELL-XPS,Dell XPS 15 9530 OLED,1,174990,142000\n" +
      "2026-10-27,SKU-1004-ASUS-ROG,ASUS ROG Zephyrus G14,3,139990,115000\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "shopsense_sales_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Sales Analytics & Batch Ingestion</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Category breakdowns, margins, recent transactions, and verified CSV billing import.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab("csvImport")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "csvImport"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV Records
          </button>
        </div>
      </div>

      {activeTab === "analytics" ? (
        <div className="space-y-6">
          {/* Category Performance Bar Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Revenue Contribution by Category (30 Days)</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Authoritative revenue distribution across hardware segments.</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData?.categoryBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrency(Number(val)),
                      name === "revenue" ? "Gross Revenue" : "Profit",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} name="Revenue" />
                  <Bar dataKey="profit" fill="#16a34a" radius={[6, 6, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Segment Profitability & Margins
              </h3>
            </div>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="p-4">Category Segment</th>
                  <th className="p-4">Units Sold</th>
                  <th className="p-4">Gross Revenue</th>
                  <th className="p-4">Gross Profit</th>
                  <th className="p-4">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {(salesData?.categoryBreakdown || []).map((cat: any) => (
                  <tr key={cat.name} className="hover:bg-zinc-50/70 transition">
                    <td className="p-4 font-bold text-zinc-900">{cat.name}</td>
                    <td className="p-4 font-semibold text-zinc-700">{cat.units} units</td>
                    <td className="p-4 font-extrabold text-zinc-900">{formatCurrency(cat.revenue)}</td>
                    <td className="p-4 font-bold text-emerald-600">{formatCurrency(cat.profit)}</td>
                    <td className="p-4">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        {cat.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CSV Import Tab */
        <div className="space-y-6 max-w-4xl">
          {commitMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{commitMessage}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Upload Sales Billing CSV</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
              Import past sales records from billing software or POS systems. Rows will be validated against
              positive quantities, dates, and catalog SKUs.
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
                  <Upload className="h-4 w-4" />
                  Select CSV File
                </span>
              </label>

              <Button
                onClick={downloadSampleTemplate}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold rounded-xl"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500" />
                Download Template CSV
              </Button>
            </div>

            {isValidating && (
              <p className="mt-4 text-xs text-blue-600 font-medium animate-pulse">
                Validating CSV rows and types...
              </p>
            )}
          </div>

          {/* Import Preview & Errors */}
          {uploadPreview && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">CSV Pre-Import Validation Report</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Found <strong>{uploadPreview.validCount} valid rows</strong> out of {uploadPreview.totalRows} total rows.
                  </p>
                </div>

                <Button
                  onClick={handleCommitImport}
                  disabled={uploadPreview.validCount === 0 || isCommitting}
                  isLoading={isCommitting}
                  className="text-xs font-semibold rounded-xl"
                >
                  Confirm & Commit {uploadPreview.validCount} Records
                </Button>
              </div>

              {/* Validation errors if any */}
              {uploadPreview.errorCount > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>{uploadPreview.errorCount} Validation Errors Detected:</span>
                  </div>
                  {uploadPreview.validationErrors.map((err: any, idx: number) => (
                    <p key={idx} className="text-[11px]">
                      • Row {err.row}: {err.error}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview table */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Sample Rows Preview (First 5)
                </h5>
                <div className="overflow-x-auto rounded-xl border border-zinc-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-400">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Units</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Est. Revenue</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {uploadPreview.previewRows.map((r: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-zinc-900">{r.productName}</td>
                          <td className="p-3">{r.units}</td>
                          <td className="p-3">{formatCurrency(r.revenue / r.units)}</td>
                          <td className="p-3 font-bold">{formatCurrency(r.revenue)}</td>
                          <td className="p-3 text-zinc-400">{new Date(r.eventDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
