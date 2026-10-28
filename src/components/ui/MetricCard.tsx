import React from "react";
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
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const borderStyles = {
    default: "border-zinc-200/80 hover:border-zinc-300",
    warning: "border-orange-200 bg-orange-50/20 hover:border-orange-300",
    success: "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300",
    danger: "border-red-200 bg-red-50/20 hover:border-red-300",
  };

  return (
    <Card className={cn("p-5 transition-all shadow-sm", borderStyles[variant])}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
          {Icon && (
            <div className="rounded-lg bg-zinc-100 p-2 text-zinc-700">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold tracking-tight text-zinc-900">{value}</h4>
        </div>

        {(change !== undefined || subtitle) && (
          <div className="mt-2 flex items-center text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  "mr-1.5 flex items-center font-medium",
                  isPositive && "text-emerald-600",
                  isNegative && "text-red-600",
                  !isPositive && !isNegative && "text-zinc-500"
                )}
              >
                {isPositive && <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
                {isNegative && <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
                {!isPositive && !isNegative && <Minus className="mr-0.5 h-3.5 w-3.5" />}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}
            <span className="text-zinc-500">{subtitle || changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
