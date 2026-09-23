"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Printer, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { InvoiceDocument } from "@/components/admin/invoice";
import { ShippingLabel } from "@/components/admin/label";
import { usePrint } from "@/components/admin/print";
import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { PageHeader } from "@/components/admin/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { DEFAULT_LABEL_CONFIG, normalizeLabelConfig, type LabelConfig } from "@/lib/label";
import type { AdminOrderDetail, InvoiceDetail, StoreSettings } from "@/types";

type StoreInfo = {
  store_name: string | null;
  support_phone: string | null;
  support_email: string | null;
};

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const PAYMENT_METHODS = ["CASH", "CARD", "BANK_TRANSFER", "COD", "OTHER"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { print: doPrint, portal: printPortal } = usePrint();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [store, setStore] = useState<StoreInfo>({ store_name: null, support_phone: null, support_email: null });
  const [labelConfig, setLabelConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payReference, setPayReference] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paySaving, setPaySaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [orderRes, settingsRes] = await Promise.all([
        adminApi<{ data: AdminOrderDetail }>(`/api/admin/orders/${params.id}`),
        adminApi<{ data: Partial<StoreSettings> }>("/api/admin/settings").catch(() => null),
      ]);
      setOrder(orderRes.data);
      if (settingsRes?.data) {
        setStore({
          store_name: settingsRes.data.store_name ?? "Portage",
          support_phone: settingsRes.data.support_phone ?? null,
          support_email: settingsRes.data.support_email ?? null,
        });
        setLabelConfig(normalizeLabelConfig(settingsRes.data.label_settings));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Yield so no state is updated synchronously inside the effect.
      await Promise.resolve();
      if (cancelled) return;
      await load();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function updateStatus(status: string) {
    if (!order || status === order.status) return;
    if (status === "CANCELLED" || status === "RETURNED") {
      const message =
        status === "RETURNED"
          ? "Returning this order records the return, puts taken stock back on the shelves and refunds any received payment. Continue?"
          : "Cancelling this order returns any taken stock to the shelves. Continue?";
      if (!window.confirm(message)) return;
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

  function openPayment() {
    if (!order) return;
    setPayOpen(true);
    setPayAmount(String(Math.max(0, order.total - order.paid_total)));
    setPayMethod(order.payment_method === "COD" ? "CASH" : order.payment_method);
    setPayReference("");
    setPayNotes("");
  }

  async function submitPayment() {
    if (!order || paySaving) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a payment amount greater than zero.");
      return;
    }
    setPaySaving(true);
    try {
      const res = await adminApi<{ message: string }>(`/api/admin/orders/${order.id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount,
          method: payMethod,
          reference: payReference.trim() || null,
          notes: payNotes.trim() || null,
        }),
      });
      toast.success(res.message);
      setPayOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setPaySaving(false);
    }
  }

  function printLabel() {
    if (!order) return;
    doPrint(<ShippingLabel order={order} store={store} config={labelConfig} />);
  }

  async function createInvoice() {
    if (!order || invoiceBusy) return;
    setInvoiceBusy(true);
    try {
      const res = await adminApi<{ message: string }>(`/api/admin/orders/${order.id}/invoice`, {
        method: "POST",
      });
      toast.success(res.message);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setInvoiceBusy(false);
    }
  }

  async function printInvoice() {
    if (!order || invoiceBusy) return;
    setInvoiceBusy(true);
    try {
      const res = await adminApi<{ data: InvoiceDetail }>(`/api/admin/orders/${order.id}/invoice`);
      doPrint(<InvoiceDocument invoice={res.data} store={store} />);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setInvoiceBusy(false);
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
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={printLabel}>
              <StickyNote className="size-4" /> Print label
            </Button>
            {order.invoice ? (
              <>
                <Badge variant="outline" className="font-mono text-xs">
                  {order.invoice.invoice_number}
                </Badge>
                <Button type="button" variant="outline" size="sm" onClick={printInvoice} disabled={invoiceBusy}>
                  <Printer className="size-4" /> Print invoice
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={createInvoice} disabled={invoiceBusy}>
                <FileText className="size-4" /> Create invoice
              </Button>
            )}
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
              <span className="text-muted-foreground">Paid</span>
              <span className="tabular-nums font-medium">
                {formatMoney(order.paid_total, order.currency)} / {formatMoney(order.total, order.currency)}
              </span>
            </div>
            {order.payments.length > 0 && (
              <ul className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                {order.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="font-mono">
                      {formatMoney(p.amount, order.currency)} · {p.method}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </span>
                    <span>
                      {formatDateTime(p.created_at)}
                      {p.created_by ? ` · ${p.created_by}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={openPayment}>
              Add payment
            </Button>
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

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add payment</DialogTitle>
            <DialogDescription>
              Record a payment against {order.order_number}. Once the paid amount covers the total, the order is marked
              as paid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Balance</span>
              <span className="tabular-nums font-medium">
                {formatMoney(Math.max(0, order.paid_total), order.currency)} received of{" "}
                {formatMoney(order.total, order.currency)}
              </span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-amount">Amount ({order.currency})</Label>
              <Input
                id="pay-amount"
                type="number"
                min={0.01}
                step={0.01}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-method">Method</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger id="pay-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-reference">Reference</Label>
              <Input
                id="pay-reference"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="e.g. bank receipt no. / card last 4"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-notes">Notes</Label>
              <Textarea
                id="pay-notes"
                rows={2}
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayment} disabled={paySaving}>
              {paySaving ? "Recording…" : "Record payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printPortal}
    </div>
  );
}
