"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import { Input } from "@/components/ui/input";
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
import type { AdminCustomer, Paginated } from "@/types";

export default function CustomersPage() {
  const [data, setData] = useState<Paginated<AdminCustomer> | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set("search", query.trim());
      const res = await adminApi<{ data: Paginated<AdminCustomer> }>(`/api/admin/customers?${params}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone who ordered, with lifetime spend and acquisition source."
      />

      <form
        className="relative mb-4 max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}
      >
        <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or phone…"
          className="pl-8"
        />
      </form>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No customers found." />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">City</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Lifetime value</TableHead>
                  <TableHead className="hidden md:table-cell">First seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{customer.city ?? "—"}</TableCell>
                    <TableCell className="text-center tabular-nums">{customer.orders_count}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(customer.lifetime_value)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(customer.created_at)}
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
