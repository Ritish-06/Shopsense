"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Store, ShieldCheck, Check, Sparkles } from "lucide-react";

export function PersonaSwitcher() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleSwitch = async (role: "CUSTOMER" | "RETAILER" | "ADMIN") => {
    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsOpen(false);
        if (role === "RETAILER") {
          router.push("/retailer");
        } else if (role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (e) {
      console.error("Failed to switch demo persona:", e);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "RETAILER") {
      return {
        label: "Retailer (Apex Tech)",
        icon: Store,
        color: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (role === "ADMIN") {
      return {
        label: "Administrator",
        icon: ShieldCheck,
        color: "bg-purple-50 text-purple-700 border-purple-200",
      };
    }
    return {
      label: "Customer (Rahul)",
      icon: User,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const currentBadge = getRoleBadge(currentUser?.role || "CUSTOMER");
  const CurrentIcon = currentBadge.icon;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm transition hover:shadow ${currentBadge.color}`}
        title="Click to switch demo role"
      >
        <CurrentIcon className="h-3.5 w-3.5" />
        <span>{currentBadge.label}</span>
        <span className="text-[10px] text-zinc-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-zinc-200 bg-white p-2 shadow-elevated z-50">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Switch Demo Persona
          </div>

          <button
            onClick={() => handleSwitch("CUSTOMER")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-zinc-50"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-emerald-100 p-1 text-emerald-700">
                <User className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Customer Persona</p>
                <p className="text-[11px] text-zinc-500">Rahul Sharma (Shopper)</p>
              </div>
            </div>
            {currentUser?.role === "CUSTOMER" && <Check className="h-4 w-4 text-emerald-600" />}
          </button>

          <button
            onClick={() => handleSwitch("RETAILER")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-zinc-50"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-blue-100 p-1 text-blue-700">
                <Store className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Retailer Persona</p>
                <p className="text-[11px] text-zinc-500">Apex Tech Direct (Owner)</p>
              </div>
            </div>
            {currentUser?.role === "RETAILER" && <Check className="h-4 w-4 text-blue-600" />}
          </button>

          <button
            onClick={() => handleSwitch("ADMIN")}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-zinc-50"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-purple-100 p-1 text-purple-700">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Admin Persona</p>
                <p className="text-[11px] text-zinc-500">Platform Administrator</p>
              </div>
            </div>
            {currentUser?.role === "ADMIN" && <Check className="h-4 w-4 text-purple-600" />}
          </button>
        </div>
      )}
    </div>
  );
}
