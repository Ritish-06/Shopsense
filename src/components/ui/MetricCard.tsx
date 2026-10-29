"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./Card";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // e.g. +14.2% or -3.5%
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "warning" | "success" | "danger";
  delayMs?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = "vs previous 30 days",
  icon: Icon,
  variant = "default",
  delayMs = 0,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const borderStyles = {
    default: "border-zinc-200/90 hover:border-zinc-300 hover:shadow-card bg-white",
    warning: "border-orange-200 bg-orange-50/20 hover:border-orange-300",
    success: "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300",
    danger: "border-red-200 bg-red-50/20 hover:border-red-300",
  };

  return (
    <Card
      className={cn(
        "p-5 transition-all duration-300 shadow-sm rounded-2xl",
        borderStyles[variant],
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
          {Icon && (
            <div className="rounded-xl bg-zinc-100/80 p-2 text-zinc-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans">{value}</h4>
        </div>

        {(change !== undefined || subtitle) && (
          <div className="mt-2.5 flex items-center text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  "mr-1.5 flex items-center font-bold px-1.5 py-0.5 rounded-md",
                  isPositive && "text-emerald-700 bg-emerald-50 border border-emerald-200/60",
                  isNegative && "text-red-700 bg-red-50 border border-red-200/60",
                  !isPositive && !isNegative && "text-zinc-600 bg-zinc-100"
                )}
              >
                {isPositive && <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
                {isNegative && <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
                {!isPositive && !isNegative && <Minus className="mr-0.5 h-3.5 w-3.5" />}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}
            <span className="text-zinc-500 font-medium">{subtitle || changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
