"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { WarrantyStatusBadge } from "@/components/admin/status-badges";
import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
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
import { formatDate } from "@/lib/format";
import type { AdminWarranty, Paginated } from "@/types";

export default function WarrantiesPage() {
  const [data, setData] = useState<Paginated<AdminWarranty> | null>(null);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status !== "all") params.set("status", status);
      const res = await adminApi<{ data: Paginated<AdminWarranty> }>(`/api/admin/warranties?${params}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function markVoid(warranty: AdminWarranty) {
    try {
      await adminApi(`/api/admin/warranties/${warranty.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "VOID" }),
      });
      toast.success(`Warranty ${warranty.serial_number ?? warranty.id} voided`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Warranties"
        description="Issued automatically when an order is confirmed."
        actions={
          <Select
            value={status}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["ACTIVE", "EXPIRED", "VOID"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No warranties issued yet. Confirm an order to generate them." />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Order</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((warranty) => (
                  <TableRow key={warranty.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <BadgeCheck className="size-3.5 text-accent" />
                        {warranty.serial_number ?? `#${warranty.id}`}
                      </span>
                    </TableCell>
                    <TableCell>{warranty.product_name ?? "—"}</TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">
                      {warranty.order_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(warranty.start_date)} → {formatDate(warranty.end_date)}
                      <span className="ml-1">({warranty.warranty_months}m)</span>
                    </TableCell>
                    <TableCell>
                      <WarrantyStatusBadge status={warranty.effective_status} />
                    </TableCell>
                    <TableCell>
                      {warranty.effective_status === "ACTIVE" && (
                        <Button variant="outline" size="sm" onClick={() => markVoid(warranty)}>
                          Void
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data} onPage={setPage} />
        </>
      )}
    </div>
  );
}
