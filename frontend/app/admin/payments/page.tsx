"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { EmptyState, PageHeader, Pagination, StatCard } from "@/components/admin/shared";
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
import { adminApi } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AdminPaymentRow, AdminPaymentSummary, Paginated } from "@/types";

const METHODS = ["CASH", "CARD", "BANK_TRANSFER", "COD", "OTHER"];

export default function PaymentsPage() {
  const [data, setData] = useState<Paginated<AdminPaymentRow> | null>(null);
  const [summary, setSummary] = useState<AdminPaymentSummary>({ received: 0, count: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filters, setFilters] = useState({ search: "", method: "", dateFrom: "", dateTo: "" });

  const [editing, setEditing] = useState<AdminPaymentRow | null>(null);
  const [deleting, setDeleting] = useState<AdminPaymentRow | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMethod, setEditMethod] = useState("CASH");
  const [editReference, setEditReference] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filters.search) params.set("search", filters.search);
      if (filters.method) params.set("method", filters.method);
      if (filters.dateFrom) params.set("date_from", filters.dateFrom);
      if (filters.dateTo) params.set("date_to", filters.dateTo);
      params.set("per_page", "25");

      const res = await adminApi<{ data: Paginated<AdminPaymentRow>; summary: AdminPaymentSummary }>(
        `/api/admin/payments?${params}`,
      );
      setData(res.data);
      setSummary(res.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      await load();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function applyFilters(e?: { preventDefault(): void }) {
    e?.preventDefault();
    setPage(1);
    setFilters({ search: search.trim(), method, dateFrom, dateTo });
  }

  function openEdit(payment: AdminPaymentRow) {
    setEditing(payment);
    setEditAmount(String(payment.amount));
    setEditMethod(payment.method);
    setEditReference(payment.reference ?? "");
    setEditNotes(payment.notes ?? "");
  }

  async function submitEdit() {
    if (!editing || saving) return;
    const amount = Number(editAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi<{ message: string }>(`/api/admin/payments/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          amount,
          method: editMethod,
          reference: editReference.trim() || null,
          notes: editNotes.trim() || null,
        }),
      });
      toast.success(res.message);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting || saving) return;
    setSaving(true);
    try {
      const res = await adminApi<{ message: string }>(`/api/admin/payments/${deleting.id}`, {
        method: "DELETE",
      });
      toast.success(res.message);
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete payment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Ledger of every payment recorded against orders. Editing or deleting a payment recalculates the order's payment status automatically."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Received (filtered)" value={formatMoney(summary.received)} hint={`${summary.count} payment${summary.count === 1 ? "" : "s"}`} />
        <StatCard label="Outstanding orders" value="Open orders tab" hint="Track balances from the orders list" />
      </div>

      <form onSubmit={applyFilters} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="pay-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <Input
            id="pay-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order no, customer, phone, reference"
            className="w-64"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-method" className="text-xs text-muted-foreground">
            Method
          </Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="pay-method" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input id="pay-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pay-to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input id="pay-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
        <Button type="submit" variant="outline">
          Apply
        </Button>
        {(filters.search || filters.method || filters.dateFrom || filters.dateTo) && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch("");
              setMethod("ALL");
              setDateFrom("");
              setDateTo("");
              setPage(1);
              setFilters({ search: "", method: "", dateFrom: "", dateTo: "" });
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No payments match. Record a payment from the order detail page." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Recorded by</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      {payment.order ? (
                        <Link
                          href={`/admin/orders/${payment.order.id}`}
                          className="font-mono font-medium hover:text-accent hover:underline"
                        >
                          {payment.order.order_number}
                        </Link>
                      ) : (
                        "—"
                      )}
                      {payment.order && (
                        <PaymentStatusBadge status={payment.order.payment_status} />
                      )}
                    </TableCell>
                    <TableCell>{payment.customer_name ?? "—"}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {payment.method}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-32 truncate font-mono text-xs">
                      {payment.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.created_by ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit payment" onClick={() => openEdit(payment)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete payment"
                          className="text-red-700 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleting(payment)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data} onPage={setPage} />
        </>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit payment</DialogTitle>
            <DialogDescription>
              {editing?.order?.order_number ?? ""} — the order&apos;s payment status is recalculated after saving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="edit-amount">Amount ({editing?.currency ?? "QAR"})</Label>
              <Input id="edit-amount" type="number" min={0.01} step={0.01} value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-method">Method</Label>
              <Select value={editMethod} onValueChange={setEditMethod}>
                <SelectTrigger id="edit-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-reference">Reference</Label>
              <Input id="edit-reference" value={editReference} onChange={(e) => setEditReference(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" rows={2} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete payment?</DialogTitle>
            <DialogDescription>
              {deleting ? `${formatMoney(deleting.amount, deleting.currency)} recorded ${formatDateTime(deleting.created_at)}` : ""}.
              The record is soft-deleted for audit purposes and the order&apos;s payment status is recalculated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}