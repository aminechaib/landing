"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  const variant =
    status === "DELIVERED"
      ? "success"
      : status === "CANCELLED" || status === "RETURNED"
        ? "destructive"
        : status === "PENDING"
          ? "warning"
          : "secondary";
  return <Badge variant={variant as never}>{status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const variant = status === "PAID" ? "success" : status === "FAILED" ? "destructive" : "outline";
  return <Badge variant={variant as never}>{status}</Badge>;
}

export function StockBadge({ quantity, threshold = 10 }: { quantity: number; threshold?: number }) {
  if (quantity <= 0) return <Badge variant="destructive">OUT OF STOCK</Badge>;
  if (quantity <= threshold) {
    return (
      <Badge variant="warning">
        LOW · {quantity}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      IN STOCK · {quantity}
    </Badge>
  );
}

export function ProductStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "ACTIVE" ? "success" : status === "INACTIVE" ? "warning" : "outline"}
      className={cn(status === "DISCONTINUED" && "text-muted-foreground")}
    >
      {status}
    </Badge>
  );
}

export function WarrantyStatusBadge({ status }: { status: string }) {
  const variant = status === "ACTIVE" ? "success" : status === "VOID" ? "destructive" : "secondary";
  return <Badge variant={variant as never}>{status}</Badge>;
}

const MOVEMENT_COLORS: Record<string, string> = {
  IN: "text-emerald-700 bg-emerald-50",
  RETURN: "text-emerald-700 bg-emerald-50",
  OUT: "text-red-800 bg-red-50",
  DAMAGED: "text-red-800 bg-red-50",
  ADJUSTMENT: "text-blue-800 bg-blue-50",
};

export function MovementTypeBadge({ type, quantity }: { type: string; quantity: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span className={cn("rounded-full px-2 py-0.5", MOVEMENT_COLORS[type] ?? "bg-secondary")}>
        {type}
      </span>
      <span className={cn("font-mono tabular-nums", quantity >= 0 ? "text-emerald-700" : "text-red-700")}>
        {quantity > 0 ? `+${quantity}` : quantity}
      </span>
    </span>
  );
}
