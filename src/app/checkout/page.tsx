"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState("Rahul Sharma");
  const [line1, setLine1] = useState("Flat 402, Green Glen Residency, Outer Ring Road");
  const [line2, setLine2] = useState("Bellandur");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("560103");
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        if (data.cart) setCart(data.cart);
      })
      .catch((err) => console.error("Error loading cart for checkout:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName,
            line1,
            line2,
            city,
            state,
            postalCode,
          },
          paymentMethod:
            paymentMethod === "CARD"
              ? "Credit Card (Visa ending in 4242)"
              : paymentMethod === "UPI"
              ? "UPI (rahul@okaxis)"
              : "Net Banking (HDFC)",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete checkout transaction");
      }

      // Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      router.push(`/orders/${data.orderId}?confirmed=true`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading checkout details...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-zinc-500">Add products to your cart before proceeding to checkout.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <div className="mb-6 pb-4 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Checkout & Order Placement</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review delivery address and authorize sandbox demo payment
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Address + Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
              <Truck className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                1. Delivery Address
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Full Recipient Name</label>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Street Address Line 1</label>
                <Input
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Apartment, Landmark, Suite (Optional)</label>
                <Input
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">City</label>
                  <Input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">State</label>
                  <Input
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Postal Code</label>
                  <Input
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                2. Payment Method (Demo Gateway)
              </h2>
            </div>

            <div className="space-y-2.5">
              <label
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer text-xs transition ${
                  paymentMethod === "CARD"
                    ? "border-blue-600 bg-blue-50/40 text-blue-900 font-semibold"
                    : "border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="text-blue-600"
                  />
                  <span>Credit / Debit Card (Visa / Mastercard Demo)</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-normal">•••• 4242</span>
              </label>

              <label
                className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer text-xs transition ${
                  paymentMethod === "UPI"
                    ? "border-blue-600 bg-blue-50/40 text-blue-900 font-semibold"
                    : "border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={() => setPaymentMethod("UPI")}
                    className="text-blue-600"
                  />
                  <span>UPI Instant Payment (GooglePay, PhonePe)</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-normal">Instant 0% Fee</span>
              </label>
            </div>

            <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-200 p-3 text-[11px] text-zinc-500">
              <strong>Simulated Sandbox Environment:</strong> No real money will be charged. This demonstrates
              concurrency-safe stock deduction, payment transaction creation, and movement auditing.
            </div>
          </div>
        </div>

        {/* Right Summary: Review & Authorize (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-bold text-zinc-900 mb-4 pb-3 border-b border-zinc-100 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              Order Items ({cart.items.length})
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50 p-0.5">
                      <img src={item.image} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 line-clamp-1">{item.title}</span>
                      <span className="text-[11px] text-zinc-500">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-zinc-200 pt-3 space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% inclusive)</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(cart.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)}
                </span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Savings</span>
                  <span>-{formatCurrency(cart.discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-200 pt-4 mb-5 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-zinc-900 block">Total Due</span>
                <span className="text-[10px] text-zinc-400">Authorized upon click</span>
              </div>
              <span className="text-2xl font-black text-zinc-900">
                {formatCurrency(cart.total)}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full font-bold rounded-xl text-sm"
              size="lg"
            >
              <span>Authorize & Place Order</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Concurrency-Safe Stock Reservation</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
