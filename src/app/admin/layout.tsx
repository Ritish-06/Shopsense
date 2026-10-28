"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ScrollText,
  Settings,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Platform Overview", href: "/admin", icon: Activity },
  { label: "Users & Accounts", href: "/admin/users", icon: Users },
  { label: "Retailer Moderation", href: "/admin/retailers", icon: Store },
  { label: "Catalog Moderation", href: "/admin/products", icon: Package },
  { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-zinc-50/60">
      <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
                SS
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 leading-none">Platform Admin</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">ShopSense Root Operations</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                    isActive
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-purple-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Storefront
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              Administrative Root Session Verified
            </span>
          </div>
        </header>

        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
