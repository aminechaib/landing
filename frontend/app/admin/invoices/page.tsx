"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, X } from "lucide-react";
import { toast } from "sonner";

import { InvoiceDocument } from "@/components/admin/invoice";
import { usePrint } from "@/components/admin/print";
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
import { adminApi } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { InvoiceDetail, InvoiceRow, Paginated, StoreSettings } from "@/types";

export default function InvoicesPage() {
  const { print: doPrint, portal: printPortal } = usePrint();
  const [data, setData] = useState<Paginated<InvoiceRow> | null>(null);
  const [store, setStore] = useState<Partial<StoreSettings>>({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<InvoiceRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status !== "ALL") params.set("status", status);
      params.set("per_page", "25");

      const res = await adminApi<{ data: Paginated<InvoiceRow> }>(`/api/admin/invoices?${params}`);
      setData(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

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

  useEffect(() => {
    adminApi<{ data: Partial<StoreSettings> }>("/api/admin/settings")
      .then((res) => setStore(res.data))
      .catch(() => {});
  }, []);

  async function printInvoice(row: InvoiceRow) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await adminApi<{ data: InvoiceDetail }>(`/api/admin/orders/${row.order_id}/invoice`);
      doPrint(<InvoiceDocument invoice={res.data} store={store} />);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancel() {
    if (!cancelling || busy) return;
    setBusy(true);
    try {
      const res = await adminApi<{ message: string }>(`/api/admin/invoices/${cancelling.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      toast.success(res.message);
      setCancelling(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Sequential invoices, issued one per order. Print from the list or cancel an issued invoice."
        actions={
          <div className="flex items-center gap-2">
            <Label htmlFor="inv-status" className="text-xs text-muted-foreground">
              Status
            </Label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger id="inv-status" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No invoices yet. Create one from an order's detail page." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="whitespace-nowrap font-mono font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      {invoice.order_id ? (
                        <Link
                          href={`/admin/orders/${invoice.order_id}`}
                          className="font-mono text-xs text-muted-foreground hover:text-accent hover:underline"
                        >
                          {invoice.order_number ?? `#${invoice.order_id}`}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{invoice.customer_name ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {invoice.issued_at ? formatDateTime(invoice.issued_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "CANCELLED" ? "secondary" : "success"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        {invoice.status === "ISSUED" && (
                          <Button variant="ghost" size="icon" aria-label="Print invoice" onClick={() => printInvoice(invoice)}>
                            <Printer className="size-4" />
                          </Button>
                        )}
                        {invoice.status === "ISSUED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Cancel invoice"
                            className="text-red-700 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setCancelling(invoice)}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
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

      <Dialog open={!!cancelling} onOpenChange={(v) => !v && setCancelling(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel invoice {cancelling?.invoice_number ?? ""}?</DialogTitle>
            <DialogDescription>
              The invoice is marked cancelled and is no longer valid for payment. The order itself is not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelling(null)}>
              Keep invoice
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={busy}>
              {busy ? "Cancelling…" : "Cancel invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {printPortal}
    </div>
  );
}