import React from "react";
import { Badge } from "./Badge";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface StockBadgeProps {
  quantity: number;
  reorderPoint?: number;
  showExactCount?: boolean;
}

export function StockBadge({ quantity, reorderPoint = 15, showExactCount = true }: StockBadgeProps) {
  if (quantity <= 0) {
    return (
      <Badge variant="destructive" className="gap-1 font-medium">
        <XCircle className="h-3.5 w-3.5" />
        Out of Stock
      </Badge>
    );
  }

  if (quantity <= reorderPoint) {
    return (
      <Badge variant="warning" className="gap-1 font-medium">
        <AlertTriangle className="h-3.5 w-3.5" />
        {showExactCount ? `Low Stock (${quantity} left)` : "Low Stock"}
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1 font-medium">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {showExactCount ? `In Stock (${quantity})` : "In Stock"}
    </Badge>
  );
}
