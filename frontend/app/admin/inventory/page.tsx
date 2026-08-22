"use client";

import { useCallback, useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { MovementTypeBadge, StockBadge } from "@/components/admin/status-badges";
import { EmptyState, PageHeader, Pagination } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/api";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type {
  InventoryBatchRow,
  InventoryMovementRow,
  Paginated,
  ProductOption,
} from "@/types";

type SupplierOption = { id: number; name: string };

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  // Receive form
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [invoice, setInvoice] = useState("");
  const [saving, setSaving] = useState(false);

  // Batches
  const [batches, setBatches] = useState<Paginated<InventoryBatchRow> | null>(null);
  const [batchPage, setBatchPage] = useState(1);
  const [batchesLoading, setBatchesLoading] = useState(true);

  // Movements
  const [movements, setMovements] = useState<Paginated<InventoryMovementRow> | null>(null);
  const [movementPage, setMovementPage] = useState(1);
  const [movementsLoading, setMovementsLoading] = useState(true);

  const loadStatic = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        adminApi<{ data: ProductOption[] }>("/api/admin/products-all"),
        adminApi<{ data: SupplierOption[] }>("/api/admin/suppliers"),
      ]);
      setProducts(p.data);
      setSuppliers(s.data);
    } catch {
      /* handled by guard */
    }
  }, []);

  const loadBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await adminApi<{ data: Paginated<InventoryBatchRow> }>(
        `/api/admin/inventory/batches?page=${batchPage}`,
      );
      setBatches(res.data);
    } finally {
      setBatchesLoading(false);
    }
  }, [batchPage]);

  const loadMovements = useCallback(async () => {
    setMovementsLoading(true);
    try {
      const res = await adminApi<{ data: Paginated<InventoryMovementRow> }>(
        `/api/admin/inventory/movements?page=${movementPage}`,
      );
      setMovements(res.data);
    } finally {
      setMovementsLoading(false);
    }
  }, [movementPage]);

  useEffect(() => {
    loadStatic();
    loadBatches();
  }, [loadStatic, loadBatches]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  async function handleReceive(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return void toast.error("Select a product");
    setSaving(true);
    try {
      await adminApi("/api/admin/inventory/receive", {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(productId),
          supplier_id: supplierId ? Number(supplierId) : null,
          quantity: Number(quantity),
          purchase_price: purchasePrice === "" ? 0 : Number(purchasePrice),
          arrival_date: arrivalDate || null,
          supplier_invoice_number: invoice.trim() || null,
        }),
      });
      toast.success("Stock received — inventory updated");
      setOpen(false);
      setProductId("");
      setSupplierId("");
      setQuantity("");
      setPurchasePrice("");
      setArrivalDate("");
      setInvoice("");
      await Promise.all([loadBatches(), loadMovements()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record arrival");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Batch-tracked arrivals with a full movement ledger."
        actions={
          <Button onClick={() => setOpen(true)}>
            <PackagePlus className="size-4" /> Receive stock
          </Button>
        }
      />

      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="mt-5">
          {batchesLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : !batches?.data?.length ? (
            <EmptyState message="No inventory batches recorded yet." />
          ) : (
            <>
              <div className="rounded-xl border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden sm:table-cell">Batch #</TableHead>
                      <TableHead className="hidden md:table-cell">Supplier</TableHead>
                      <TableHead className="text-center">Remaining</TableHead>
                      <TableHead className="hidden lg:table-cell">Unit cost</TableHead>
                      <TableHead>Arrived</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.data.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <div className="font-medium">{batch.product?.name ?? `#${batch.id}`}</div>
                          <div className="text-xs text-muted-foreground">{batch.product?.sku}</div>
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs sm:table-cell">
                          {batch.batch_number ?? "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{batch.supplier?.name ?? "—"}</TableCell>
                        <TableCell className="text-center">
                          <StockBadge quantity={batch.quantity_remaining} />
                        </TableCell>
                        <TableCell className="hidden tabular-nums lg:table-cell">
                          {batch.purchase_price != null ? formatMoney(Number(batch.purchase_price)) : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(batch.arrival_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination page={batches} onPage={setBatchPage} />
            </>
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-5">
          {movementsLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : !movements?.data?.length ? (
            <EmptyState message="No stock movements recorded yet." />
          ) : (
            <>
              <div className="rounded-xl border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="hidden md:table-cell">Reference</TableHead>
                      <TableHead className="hidden sm:table-cell">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.data.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(movement.created_at)}
                        </TableCell>
                        <TableCell>
                          <MovementTypeBadge type={movement.type} quantity={Number(movement.quantity)} />
                        </TableCell>
                        <TableCell>{movement.product?.name ?? `#${movement.product}`}</TableCell>
                        <TableCell className="hidden max-w-52 truncate text-muted-foreground md:table-cell">
                          {movement.reference_type ?? "—"}
                          {movement.reference_id ? ` #${movement.reference_id}` : ""}
                        </TableCell>
                        <TableCell className="hidden max-w-40 truncate text-muted-foreground sm:table-cell">
                          {movement.reason ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination page={movements} onPage={setMovementPage} />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Receive stock sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Receive stock</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleReceive} className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-5">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select value={productId || undefined} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Select value={supplierId || "none"} onValueChange={(v) => setSupplierId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No supplier</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inv-qty">Quantity</Label>
                <Input
                  id="inv-qty"
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-cost">Unit cost</Label>
                <Input
                  id="inv-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-date">Arrival date</Label>
              <Input
                id="inv-date"
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-invoice">Supplier invoice #</Label>
              <Input id="inv-invoice" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
            </div>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={saving} className="w-full">
                Record arrival
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
