"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/status-badges";
import { PageHeader, StatCard } from "@/components/admin/shared";
import { Card } from "@/components/ui/card";
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
import { formatDate, formatMoney } from "@/lib/format";
import type { AdminStats, AdminOrder } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminApi<{ data: AdminStats }>("/api/admin/stats"),
      adminApi<{ data: AdminOrder[] }>("/api/admin/recent-orders"),
    ])
      .then(([statsRes, recentRes]) => {
        if (cancelled) return;
        setStats(statsRes.data);
        setRecent(recentRes.data ?? []);
      })
      .catch((err) => console.error(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of store performance." />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue today"
              value={formatMoney(stats?.todays_revenue ?? 0)}
              hint={`${stats?.todays_orders ?? 0} order(s) today`}
            />
            <StatCard label="Pending orders" value={stats?.pending_orders ?? 0} hint="Awaiting confirmation" />
            <StatCard
              label="Units in stock"
              value={stats?.total_stock ?? 0}
              hint={`${stats?.total_products ?? 0} products`}
            />
            <StatCard
              label="Stock alerts"
              value={(stats?.low_stock ?? 0) + (stats?.out_of_stock ?? 0)}
              hint={`${stats?.low_stock ?? 0} low · ${stats?.out_of_stock ?? 0} out`}
            />
          </div>

          <Card className="mt-6 gap-0 p-0 pb-1">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-sm font-semibold">Latest orders</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-accent hover:underline">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(Number(order.total), order.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
