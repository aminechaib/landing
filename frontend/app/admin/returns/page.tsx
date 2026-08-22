"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AdminReturn, Paginated } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  RESTOCK: "Restocked",
  REPAIR: "Repair",
  REPLACE: "Replacement",
  REFUND: "Refunded",
};

export default function ReturnsPage() {
  const [data, setData] = useState<Paginated<AdminReturn> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Returns"
        description="Registered returns. Items marked “Restock” were returned to inventory automatically."
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState
          message="No returns registered. Mark an order as RETURNED to create one with automatic restocking."
        />
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
    </div>
  );
}
