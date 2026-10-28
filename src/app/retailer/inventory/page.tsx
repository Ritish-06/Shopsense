"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  AlertTriangle,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  TrendingDown,
  Clock,
  Edit3,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StockBadge } from "@/components/ui/StockBadge";
import { InventoryIntelligenceItem } from "@/lib/retail-intelligence";

export default function RetailerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryIntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW_STOCK" | "SLOW_MOVING">("ALL");

  // Adjustment modal state
  const [selectedItem, setSelectedItem] = useState<InventoryIntelligenceItem | null>(null);
  const [newQty, setNewQty] = useState("");
  const [adjustReason, setAdjustReason] = useState<"RESTOCK" | "DAMAGE" | "RECONCILIATION" | "CYCLE_COUNT">("RESTOCK");
  const [adjustNote, setAdjustNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const fetchInventory = () => {
    fetch("/api/retailer/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (data.inventory) setInventory(data.inventory);
      })
      .catch((err) => console.error("Error loading inventory:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdjust = (item: InventoryIntelligenceItem) => {
    setSelectedItem(item);
    setNewQty(String(item.currentStock));
    setAdjustReason("RESTOCK");
    setAdjustNote("");
    setAdjustSuccess(false);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !newQty) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/retailer/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: selectedItem.id,
          newQuantity: parseInt(newQty, 10),
          reason: adjustReason,
          note: adjustNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdjustSuccess(true);
        fetchInventory();
        setTimeout(() => {
          setSelectedItem(null);
          setAdjustSuccess(false);
        }, 1500);
      } else {
        alert(data.error || "Failed to adjust stock");
      }
    } catch {
      alert("Error adjusting inventory record");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered inventory
  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "LOW_STOCK") return item.isLowStock;
    if (filter === "SLOW_MOVING") return item.isSlowMoving;
    return true;
  });

  const lowStockTotal = inventory.filter((i) => i.isLowStock).length;
  const slowMovingTotal = inventory.filter((i) => i.isSlowMoving).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Inventory Intelligence & Control</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time stock ledger, sales velocity, reorder point thresholds, and stock movements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/retailer/inventory/forecast">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
              <span>View Demand Forecasts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Tracked Catalog SKUs
          </span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">{inventory.length}</span>
        </div>

        <div
          onClick={() => setFilter("LOW_STOCK")}
          className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 cursor-pointer hover:bg-orange-50 transition"
        >
          <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <span className="text-2xl font-black text-orange-900 mt-1 block">{lowStockTotal}</span>
        </div>

        <div
          onClick={() => setFilter("SLOW_MOVING")}
          className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 cursor-pointer hover:bg-purple-50 transition"
        >
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
            Slow Moving Excess
          </span>
          <span className="text-2xl font-black text-purple-900 mt-1 block">{slowMovingTotal}</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Total Warehouse Units
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {inventory.reduce((s, i) => s + i.currentStock, 0)}
          </span>
        </div>
      </div>

      {/* Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, model, or brand..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "ALL" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            All Inventory ({inventory.length})
          </button>
          <button
            onClick={() => setFilter("LOW_STOCK")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "LOW_STOCK" ? "bg-orange-600 text-white" : "text-orange-700 hover:bg-orange-50"
            }`}
          >
            Low Stock ({lowStockTotal})
          </button>
          <button
            onClick={() => setFilter("SLOW_MOVING")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filter === "SLOW_MOVING" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-50"
            }`}
          >
            Slow-Moving ({slowMovingTotal})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/50 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="p-4">Product & SKU</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Daily Velocity</th>
              <th className="p-4">Days Remaining</th>
              <th className="p-4">Reorder Point</th>
              <th className="p-4">Health Assessment</th>
              <th className="p-4">Suggested Restock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50/70 transition">
                <td className="p-4">
                  <span className="font-bold text-zinc-900 block">{item.productTitle}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {item.brand} • {item.sku}
                  </span>
                </td>

                <td className="p-4 font-bold text-sm text-zinc-900">
                  {item.currentStock} units
                </td>

                <td className="p-4">
                  <span className="font-semibold text-zinc-800">{item.salesVelocityDaily}</span>{" "}
                  <span className="text-zinc-400">units/day</span>
                </td>

                <td className="p-4">
                  {item.daysOfStockRemaining !== null ? (
                    <span
                      className={`font-bold ${
                        item.daysOfStockRemaining <= 7
                          ? "text-red-600 font-extrabold"
                          : item.daysOfStockRemaining <= 14
                          ? "text-orange-600"
                          : "text-zinc-800"
                      }`}
                    >
                      {item.daysOfStockRemaining} days
                    </span>
                  ) : (
                    <span className="text-zinc-400">No recent velocity</span>
                  )}
                </td>

                <td className="p-4">
                  <span className="font-medium text-zinc-700">{item.reorderPoint} units</span>
                  <span className="text-[10px] text-zinc-400 block">
                    (Safety: {item.safetyStock}, Lead: {item.leadTimeDays}d)
                  </span>
                </td>

                <td className="p-4">
                  {item.isLowStock ? (
                    <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock Risk
                    </span>
                  ) : item.isSlowMoving ? (
                    <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                      Excess Inventory
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Healthy Stock
                    </span>
                  )}
                </td>

                <td className="p-4">
                  {item.suggestedReorderQuantity > 0 ? (
                    <span className="font-bold text-blue-600">
                      +{item.suggestedReorderQuantity} units
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>

                <td className="p-4 text-right">
                  <Button
                    onClick={() => handleOpenAdjust(item)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5 font-semibold"
                  >
                    <Edit3 className="mr-1 h-3 w-3" />
                    Adjust
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-elevated animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Adjust Warehouse Stock</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{selectedItem.productTitle}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {adjustSuccess ? (
              <div className="py-8 text-center text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                Stock adjusted and auditable ledger entry recorded!
              </div>
            ) : (
              <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">
                    Current Quantity: <span className="text-zinc-900">{selectedItem.currentStock} units</span>
                  </label>
                  <label className="font-semibold text-zinc-700 block mb-1 mt-2">
                    New Authoritative Quantity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Reason for Adjustment</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs focus:border-blue-600 focus:outline-none"
                  >
                    <option value="RESTOCK">Supplier Restock (PO Inbound)</option>
                    <option value="RECONCILIATION">Physical Inventory Reconciliation</option>
                    <option value="DAMAGE">Damaged / Expired / Written Off</option>
                    <option value="CYCLE_COUNT">Scheduled Cycle Count</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">
                    Auditable Note / PO Reference (Optional)
                  </label>
                  <Input
                    placeholder="e.g. PO-8921 received from Synnex Logistics"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    size="sm"
                    className="font-semibold"
                  >
                    Commit Stock Adjustment
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
