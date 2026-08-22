"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";

import { ProductStatusBadge, StockBadge } from "@/components/admin/status-badges";
import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatMoney } from "@/lib/format";
import type { AdminProduct, Paginated } from "@/types";

export default function AdminProductsPage() {
  const [data, setData] = useState<Paginated<AdminProduct> | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status !== "all") params.set("status", status);
      if (query.trim()) params.set("search", query.trim());
      const res = await adminApi<{ data: Paginated<AdminProduct> }>(`/api/admin/products?${params}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }, [page, status, query]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Products"
        description="Catalog management with live stock levels."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          className="relative"
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
            placeholder="Name or SKU…"
            className="w-64 pl-8"
          />
        </form>
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["ACTIVE", "INACTIVE", "DISCONTINUED"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : !data?.data?.length ? (
        <EmptyState message="No products found." />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link href={`/admin/products/${product.id}`} className="font-medium hover:text-accent hover:underline">
                        {product.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>
                      <StockBadge quantity={product.stock_quantity} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(Number(product.selling_price), product.currency ?? "USD")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild aria-label={`Edit ${product.name}`}>
                        <Link href={`/admin/products/${product.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
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
