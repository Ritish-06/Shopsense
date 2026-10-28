"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = () => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) setCart(data.cart);
      })
      .catch((err) => console.error("Error fetching cart:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(itemId);
    try {
      const res = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty }),
      });
      if (res.ok) fetchCart();
    } catch (err) {
      console.error("Failed to update qty:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/cart/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading shopping cart...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any tech products to your cart yet. Explore our verified catalog!"
          actionLabel="Explore Products Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-6">
        Shopping Cart ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item: any) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:border-zinc-300"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 p-1">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop"}
                    alt={item.title}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {item.brand}
                  </span>
                  <Link href={`/products/${item.slug}`} className="block">
                    <h3 className="text-sm font-semibold text-zinc-900 hover:text-blue-600 line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs font-bold text-zinc-900 mt-1">
                    {formatCurrency(item.price)}
                  </p>
                  {item.availableStock <= 10 && (
                    <span className="text-[10px] font-medium text-orange-600 block mt-0.5">
                      Only {item.availableStock} left in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-0.5">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={updatingId === item.id || item.quantity <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-white disabled:opacity-40"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-zinc-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={updatingId === item.id || item.quantity >= item.availableStock}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:bg-white disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updatingId === item.id}
                    className="text-[11px] font-medium text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
            <Link href="/products" className="text-blue-600 font-semibold hover:underline">
              ← Continue Shopping
            </Link>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Verified Authentic Stock Guaranteed
            </div>
          </div>
        </div>

        {/* Order Summary Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-zinc-900 mb-4 pb-3 border-b border-zinc-100">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.reduce((s: number, i: any) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% inclusive estimate)</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(cart.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)}
                </span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Savings</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
              )}
            </div>

            <div className="my-4 border-t border-zinc-200 pt-4 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-zinc-900 block">Total Due</span>
                <span className="text-[10px] text-zinc-400">All taxes included</span>
              </div>
              <span className="text-2xl font-black text-zinc-900">
                {formatCurrency(cart.total)}
              </span>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              className="w-full font-semibold rounded-xl text-sm"
              size="lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-zinc-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Simulated Payment Gateway Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
