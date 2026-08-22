"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, apiUpload } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type {
  AdminCategory,
  Brand,
  AdminProductDetail,
  ProductHistory,
} from "@/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [history, setHistory] = useState<ProductHistory | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [productRes, categoriesRes, brandsRes, historyRes] = await Promise.all([
        adminApi<{ data: AdminProductDetail }>(`/api/admin/products/${params.id}`),
        adminApi<{ data: AdminCategory[] }>("/api/admin/categories"),
        adminApi<{ data: Brand[] }>("/api/admin/brands"),
        adminApi<{ data: ProductHistory }>(`/api/admin/products/${params.id}/history`),
      ]);
      setProduct(productRes.data);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load product");
      router.replace("/admin/products");
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("images[]", file));
      await apiUpload(`/api/admin/products/${params.id}/images`, formData);
      toast.success("Images uploaded");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteImage(imageId: number) {
    try {
      await adminApi(`/api/admin/product-images/${imageId}`, { method: "DELETE" });
      toast.success("Image removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (!product || !categories.length || !brands.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  const openPrices = history?.price_history.filter((p) => p.valid_to === null) ?? [];

  return (
    <div>
      <PageHeader title={product.name} description={`SKU ${product.sku} · /${product.slug}`} />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Images ({product.images.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-5">
          <ProductForm categories={categories} brands={brands} initial={product} />
        </TabsContent>

        <TabsContent value="images" className="mt-5">
          <Card className="gap-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Product images</h2>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                multiple
                hidden
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <ImagePlus className="size-4" />
                {uploading ? "Uploading…" : "Upload images"}
              </Button>
            </div>
            {product.images.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No images yet — the storefront will show a placeholder.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {product.images.map((image) => (
                  <figure
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-muted/30"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-2 right-2 rounded-md bg-background/90 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </button>
                    {image.is_primary && (
                      <figcaption className="absolute bottom-0 w-full bg-primary/80 py-1 text-center text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
                        Primary
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-5 space-y-6">
          <Card className="gap-0 p-0 pb-1">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-sm font-semibold">Price history</h2>
              <span className="text-xs text-muted-foreground">
                Current stock: {history?.current_stock ?? 0}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Valid from</TableHead>
                  <TableHead>Valid until</TableHead>
                  <TableHead className="hidden sm:table-cell">Reason</TableHead>
                  <TableHead>Recorded by</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history?.price_history ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium tabular-nums">
                      {formatMoney(row.price, row.currency)}
                      {openPrices.some((open) => open.id === row.id) && (
                        <Badge variant="success" className="ml-2">
                          CURRENT
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.valid_from ? formatDate(row.valid_from) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.valid_to ? formatDate(row.valid_to) : "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate sm:table-cell">{row.reason ?? "—"}</TableCell>
                    <TableCell>{row.created_by ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {(history?.price_history.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No price records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="gap-0 p-0 pb-1">
            <h2 className="px-5 pt-4 pb-2 text-sm font-semibold">Stock batches</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-center">Received / Left</TableHead>
                  <TableHead>Unit cost</TableHead>
                  <TableHead>Arrived</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history?.batches ?? []).map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-xs">{batch.batch_number}</TableCell>
                    <TableCell>{batch.supplier ?? "—"}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {batch.quantity_received} / {batch.quantity_remaining}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(batch.purchase_price, batch.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(batch.arrival_date)}</TableCell>
                  </TableRow>
                ))}
                {(history?.batches.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No stock batches yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <p className="text-xs text-muted-foreground">
            Full movement ledger lives under Inventory → Movements.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
