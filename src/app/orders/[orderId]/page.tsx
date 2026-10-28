"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const isJustConfirmed = searchParams.get("confirmed") === "true";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error("Error loading order:", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Order Not Found</h2>
        <Link href="/orders" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to All Orders
      </Link>

      {/* Confirmation banner if just bought */}
      {isJustConfirmed && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Payment Authorized & Order Confirmed!
              </h2>
              <p className="text-xs text-emerald-700 mt-0.5">
                Thank you for your order #{order.orderNumber}. We have verified stock and created your
                shipment label.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Order Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900">Order {order.orderNumber}</h1>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Placed on {formatDate(order.createdAt)} • Fulfilled by {order.retailer?.storeName}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-extrabold text-zinc-900">
              {formatCurrency(order.totalAmount)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold block">
              {order.paymentStatus} via {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Shipment Tracker */}
        {order.shipment && (
          <div className="py-6 border-b border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Shipment Tracking
              </h3>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 text-xs flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <span className="text-zinc-500">Carrier:</span>{" "}
                <strong className="text-zinc-900">{order.shipment.carrier}</strong>
                <span className="mx-2 text-zinc-300">•</span>
                <span className="text-zinc-500">Waybill:</span>{" "}
                <code className="font-bold text-blue-600">{order.shipment.trackingNumber}</code>
              </div>
              <div className="text-emerald-700 font-semibold">
                Status: {order.shipment.status.replace("_", " ")}
              </div>
            </div>
          </div>
        )}

        {/* Items Breakdown */}
        <div className="py-6 border-b border-zinc-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            Purchased Line Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 p-1">
                    <img src={item.image} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 line-clamp-1">{item.title}</h4>
                    <span className="text-zinc-400">Qty: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900 block">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    ({formatCurrency(item.price)} each)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Totals */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600" />
              Delivery Address Snapshot
            </h4>
            <div className="text-zinc-600 leading-relaxed bg-zinc-50 rounded-xl p-3 border border-zinc-100">
              <p className="font-semibold text-zinc-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Financial Summary
            </h4>
            <div className="space-y-2 bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% inclusive)</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {order.shipping === 0 ? "FREE" : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 font-bold text-zinc-900 text-sm">
                <span>Total Paid</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <Link href="/products">
            <Button variant="outline" size="sm">
              Continue Shopping
            </Button>
          </Link>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Auditable Transaction Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm">Loading order details...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}

