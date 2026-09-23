"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, ApiError } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AdminOrderDetail, AdminReturn, Paginated } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  RESTOCK: "Restocked",
  REPAIR: "Repair",
  REPLACE: "Replacement",
  REFUND: "Refunded",
};
const CONDITIONS = ["NEW", "USED", "DAMAGED", "DEFECTIVE"];
const ACTIONS = ["RESTOCK", "REPAIR", "REPLACE", "REFUND"];

type OrderRow = {
  id: number;
  order_number: string;
  customer_name: string | null;
  total: number;
  currency: string;
  status: string;
};

type ReturnLine = {
  order_item_id: number;
  name: string;
  maxQty: number;
  quantity: number;
  condition: string;
  action: string;
};

export default function ReturnsPage() {
  const [data, setData] = useState<Paginated<AdminReturn> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [orderQuery, setOrderQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [orderResults, setOrderResults] = useState<OrderRow[]>([]);
  const [orderDetail, setOrderDetail] = useState<AdminOrderDetail | null>(null);
  const [lines, setLines] = useState<ReturnLine[]>([]);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ data: Paginated<AdminReturn> }>(`/api/admin/returns?page=${page}`);
      setData(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Yield so the loading state is never applied synchronously in the effect.
      await Promise.resolve();
      if (cancelled) return;
      await load();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function closeDialog() {
    setOpen(false);
    setOrderQuery("");
    setOrderResults([]);
    setOrderDetail(null);
    setLines([]);
    setReason("");
  }

  async function searchOrders(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (!orderQuery.trim()) return;
    setSearching(true);
    try {
      const res = await adminApi<{ data: { data: OrderRow[] } }>(
        `/api/admin/orders?search=${encodeURIComponent(orderQuery.trim())}&per_page=8`,
      );
      setOrderResults(res.data.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function pickOrder(orderId: number) {
    try {
      const res = await adminApi<{ data: AdminOrderDetail }>(`/api/admin/orders/${orderId}`);
      setOrderDetail(res.data);
      setLines(
        res.data.items.map((item) => ({
          order_item_id: item.id,
          name: item.variant_name ? `${item.product_name} — ${item.variant_name}` : item.product_name,
          maxQty: item.quantity,
          quantity: item.quantity,
          condition: "NEW",
          action: "RESTOCK",
        })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load order");
    }
  }

  function updateLine(index: number, patch: Partial<ReturnLine>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  const totalReturnQty = lines.reduce((sum, l) => sum + l.quantity, 0);

  async function submitReturn() {
    if (!orderDetail || totalReturnQty <= 0 || saving) return;
    setSaving(true);
    try {
      const res = await adminApi<{ message: string }>("/api/admin/returns", {
        method: "POST",
        body: {
          order_id: orderDetail.id,
          reason: reason.trim() || null,
          items: lines.map((line) => ({
            order_item_id: line.order_item_id,
            quantity: line.quantity,
            condition: line.condition,
            action: line.action,
          })),
        },
      });
      toast.success(res.message);
      closeDialog();
      setPage(1);
      load();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.firstError() : err instanceof Error ? err.message : "Failed to register return";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Returns"
        description="Registered returns. Mark a delivered order as RETURNED to auto-register a full return, or register partial returns manually — RESTOCK items go back to inventory."
        actions={
          <Button onClick={() => setOpen(true)}>
            Register return
          </Button>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No returns registered yet. Returns appear automatically when an order is marked RETURNED." />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((ret) => (
              <div key={ret.id} className="rounded-xl border border-border bg-background p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium">{ret.order?.order_number ?? `#${ret.id}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {ret.customer ? `${ret.customer.first_name} ${ret.customer.last_name}` : "—"}
                      {" · "}
                      {formatDateTime(ret.created_at)}
                    </p>
                  </div>
                  <Badge variant={ret.status === "APPROVED" ? "success" : "secondary"}>{ret.status}</Badge>
                </div>

                {ret.reason && <p className="mt-3 text-sm text-muted-foreground">Reason: {ret.reason}</p>}

                {ret.items.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
                    {ret.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span>{item.product?.name ?? `#${item.product}`}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.quantity} × · {item.condition} ·{" "}
                          {ACTION_LABELS[item.action] ?? item.action}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <Pagination page={data} onPage={setPage} />
        </>
      )}

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : closeDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register return</DialogTitle>
            <DialogDescription>
              Find an order, then set quantity, condition and resolution per item. RESTOCK sends the items back to
              inventory automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <form onSubmit={searchOrders} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="order-search">Order (number, name or phone)</Label>
                <Input
                  id="order-search"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. ORD-1003 or customer name"
                />
              </div>
              <Button type="submit" disabled={searching || !orderQuery.trim()}>
                {searching ? "Searching…" : "Search"}
              </Button>
            </form>

            {!orderDetail && orderResults.length > 0 && (
              <ul className="overflow-hidden rounded-lg border border-border">
                {orderResults.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => pickOrder(order.id)}
                      className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent/20"
                    >
                      <span className="font-mono font-medium">{order.order_number}</span>
                      <span className="text-muted-foreground">
                        {" · "}
                        {order.customer_name ?? "—"} · {formatMoney(order.total, order.currency)} · {order.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {orderResults.length === 0 && orderQuery.trim() && !searching && !orderDetail && (
              <p className="text-sm text-muted-foreground">No matching orders.</p>
            )}

            {orderDetail && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-3 text-sm">
                  <span className="font-mono font-medium">{orderDetail.order_number}</span>
                  <span className="text-muted-foreground"> · {orderDetail.customer.name}</span>
                  {" — "}
                  <button type="button" onClick={() => setOrderDetail(null)} className="text-accent hover:underline">
                    Change order
                  </button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-36">Condition</TableHead>
                      <TableHead className="w-40">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={line.order_item_id}>
                        <TableCell>
                          <span className="text-sm font-medium">{line.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            ordered {line.maxQty} · max {line.maxQty}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={line.maxQty}
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(index, {
                                quantity: Math.min(line.maxQty, Math.max(1, Number(e.target.value) || 1)),
                              })
                            }
                            className="h-8 w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Select value={line.condition} onValueChange={(v) => updateLine(index, { condition: v })}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONDITIONS.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={line.action} onValueChange={(v) => updateLine(index, { action: v })}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIONS.map((a) => (
                                <SelectItem key={a} value={a}>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-1">
                  <Label htmlFor="return-reason">Reason / notes</Label>
                  <Textarea
                    id="return-reason"
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional — why is this being returned?"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              disabled={!orderDetail || totalReturnQty <= 0 || saving}
              onClick={submitReturn}
            >
              {saving ? "Registering…" : `Register return${totalReturnQty > 0 ? ` (${totalReturnQty} item${totalReturnQty === 1 ? "" : "s"})` : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}