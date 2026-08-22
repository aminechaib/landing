"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { PageHeader } from "@/components/admin/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AdminOrderDetail } from "@/types";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi<{ data: AdminOrderDetail }>(`/api/admin/orders/${params.id}`);
      setOrder(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(status: string) {
    if (!order || status === order.status) return;
    if (
      (status === "CANCELLED" || status === "RETURNED") &&
      !window.confirm(
        `${status === "CANCELLED" ? "Cancelling" : "Returning"} this order will return all items to stock. Continue?`,
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await adminApi(`/api/admin/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success(`Order marked as ${status.toLowerCase()}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Order not found.</p>;
  }

  const utmEntries = Object.entries(order.utm ?? {});

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-3"
        onClick={() => router.push("/admin/orders")}
      >
        <ArrowLeft className="size-4" /> All orders
      </Button>

      <PageHeader
        title={order.order_number}
        description={`Placed ${formatDateTime(order.created_at)} · Source ${order.source}`}
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="order-status" className="text-xs text-muted-foreground">
              Status
            </Label>
            <Select value={order.status} onValueChange={updateStatus} disabled={saving}>
              <SelectTrigger id="order-status" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items + totals */}
        <Card className="gap-0 p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.product_slug ? (
                      <Link
                        href={`/products/${item.product_slug}`}
                        target="_blank"
                        className="font-medium hover:text-accent hover:underline"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.product_name}</span>
                    )}
                    {item.sku && <div className="text-xs text-muted-foreground">{item.sku}</div>}
                    {item.variant_name && (
                      <div className="text-xs text-muted-foreground">{item.variant_name}</div>
                    )}
                    {item.warranty?.serial_number && (
                      <Badge variant="outline" className="mt-1 font-mono text-[10px]">
                        {item.warranty.serial_number}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatMoney(item.unit_price, order.currency)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(item.total, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <dl className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{formatMoney(order.shipping_cost, order.currency)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount{order.discount_code ? ` (${order.discount_code})` : ""}</dt>
                <dd className="tabular-nums">−{formatMoney(order.discount, order.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total, order.currency)}</dd>
            </div>
          </dl>
        </Card>

        {/* Customer + meta */}
        <Card className="gap-0 p-5">
          <h2 className="text-sm font-semibold">Customer</h2>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium">{order.customer.name}</p>
            <p>{order.customer.phone}</p>
            {order.customer.email && <p className="text-muted-foreground">{order.customer.email}</p>}
          </div>
          <Separator className="my-4" />
          <h2 className="text-sm font-semibold">Ship to</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {[order.customer.address, order.customer.city].filter(Boolean).join("\n") || "—"}
          </p>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="inline-flex items-center gap-2">
                {order.payment_method} <PaymentStatusBadge status={order.payment_status} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fulfillment</span>
              <span>{order.shipping_method} · {order.shipping_status}</span>
            </div>
          </div>
          {utmEntries.length > 0 && (
            <>
              <Separator className="my-4" />
              <h2 className="text-sm font-semibold">Attribution</h2>
              <dl className="mt-2 space-y-1 text-xs">
                {utmEntries.map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="max-w-40 truncate font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {(order.customer_notes || order.internal_notes) && (
            <>
              <Separator className="my-4" />
              <h2 className="text-sm font-semibold">Notes</h2>
              {order.customer_notes && (
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {order.customer_notes}
                </p>
              )}
              {order.internal_notes && (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                  {order.internal_notes}
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
