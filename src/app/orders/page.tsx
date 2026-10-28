"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error("Error loading orders:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading your order history...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={PackageCheck}
          title="No Orders Found"
          description="You haven't completed any purchases yet. Your confirmed orders and tracking numbers will appear here."
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">My Order History</h1>
      <p className="text-xs text-zinc-500 mb-6">
        Track previous orders, invoices, and shipment tracking codes.
      </p>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900">{order.orderNumber}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    {order.status}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 mt-0.5 block">
                  Placed on {formatDate(order.createdAt)} • Fulfilled by {order.retailer?.storeName}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-extrabold text-zinc-900 block">
                  {formatCurrency(order.totalAmount)}
                </span>
                <span className="text-[11px] text-zinc-500">{order.itemCount} items</span>
              </div>
            </div>

            {/* Items summary */}
            <div className="py-4 space-y-3">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50 p-0.5">
                      <img src={item.image} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-medium text-zinc-900 line-clamp-1">{item.title}</span>
                      <span className="text-zinc-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-zinc-800">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>

            {/* Footer with Tracking info & Details button */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              {order.shipment ? (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>
                    Carrier: <strong>{order.shipment.carrier}</strong> (Tracking:{" "}
                    <code className="text-blue-600">{order.shipment.trackingNumber}</code>)
                  </span>
                </div>
              ) : (
                <span className="text-zinc-400">Shipment label being generated</span>
              )}

              <Link
                href={`/orders/${order.id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
