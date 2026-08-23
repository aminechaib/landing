"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { AdminCategory, AdminProductDetail, Brand, Currency } from "@/types";

export interface ProductFormValues {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  category_id: string;
  brand_id: string;
  description: string;
  selling_price: string; // create-only; edits go through the dedicated price endpoint
  currency: string;
  warranty_months: string;
  badge: string;
  status: string;
  is_featured: boolean;
  features: { title: string; description: string }[];
  variants: { name: string; price: string }[];
}

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  barcode: "",
  category_id: "",
  brand_id: "",
  currency: "",
  description: "",
  selling_price: "",
  warranty_months: "24",
  badge: "none",
  status: "ACTIVE",
  is_featured: false,
  features: [],
  variants: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  categories,
  brands,
  currencies = [],
  initial = null,
}: {
  categories: AdminCategory[];
  brands: Brand[];
  currencies?: Currency[];
  initial?: AdminProductDetail | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [priceReason, setPriceReason] = useState("");

  useEffect(() => {
    if (!initial) return;
    setSlugTouched(true);
    setValues({
      name: initial.name,
      slug: initial.slug,
      sku: initial.sku ?? "",
      barcode: initial.barcode ?? "",
      category_id: initial.category_id ? String(initial.category_id) : "",
      brand_id: initial.brand_id ? String(initial.brand_id) : "",
      currency: initial.currency ?? "",
      description: initial.description ?? "",
      selling_price: String(initial.selling_price ?? ""),
      warranty_months: String(initial.warranty_months ?? 24),
      badge: initial.badge ?? "none",
      status: initial.status,
      is_featured: Boolean(initial.is_featured),
      features: (initial.features ?? []).map((f) => ({
        title: f.title,
        description: f.description ?? "",
      })),
      variants: (initial.variants ?? []).map((v) => ({
        name: v.name,
        price: v.price != null ? String(v.price) : "",
      })),
    });
  }, [initial]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const parentCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const selectedParentId = useMemo(() => {
    const current = categories.find((c) => String(c.id) === values.category_id);
    return current?.parent_id ? String(current.parent_id) : values.category_id;
  }, [categories, values.category_id]);
  // The admin endpoint returns a flat list — group children client-side.
  const subcategories = useMemo(
    () =>
      selectedParentId
        ? categories.filter((c) => c.parent_id === Number(selectedParentId))
        : [],
    [categories, selectedParentId],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const numeric = (v: string) => (v.trim() === "" ? null : Number(v));
      const payload: Record<string, unknown> = {
        name: values.name,
        slug: values.slug || slugify(values.name),
        sku: values.sku,
        barcode: values.barcode.trim() || null,
        category_id: values.category_id ? Number(values.category_id) : null,
        brand_id: values.brand_id ? Number(values.brand_id) : null,
        currency: values.currency || null,
        description: values.description || null,
        warranty_months: Number(values.warranty_months || 24),
        badge: values.badge === "none" ? null : values.badge,
        status: values.status,
        is_featured: values.is_featured,
        variants: values.variants
          .filter((v) => v.name.trim())
          .map((v) => ({ name: v.name.trim(), price: v.price.trim() === "" ? null : Number(v.price) })),
      };
      // Price changes on existing products must use PUT /products/{id}/price.
      if (!initial) {
        payload.selling_price = numeric(values.selling_price);
      }

      if (initial) {
        await adminApi(`/api/admin/products/${initial.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Product updated");
      } else {
        await adminApi("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Product created — receive its first stock batch from Inventory");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePrice(e: React.FormEvent) {
    e.preventDefault();
    if (!initial) return;
    try {
      await adminApi(`/api/admin/products/${initial.id}/price`, {
        method: "PUT",
        body: JSON.stringify({
          price: Number(newPrice),
          reason: priceReason.trim() || null,
        }),
      });
      toast.success("Price updated and recorded in history");
      setPriceDialogOpen(false);
      setNewPrice("");
      setPriceReason("");
      router.refresh();
      // Reload so the displayed price reflects the change.
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Price change failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Basics</h2>
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-slug">Slug</Label>
              <Input
                id="p-slug"
                required
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" required value={values.sku} onChange={(e) => set("sku", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-barcode">Barcode</Label>
            <Input
              id="p-barcode"
              value={values.barcode}
              onChange={(e) => set("barcode", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </Card>

        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Pricing &amp; warranty</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Selling price</Label>
              {initial ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="p-price"
                    value={formatMoney(Number(initial.selling_price), initial.currency)}
                    disabled
                  />
                  <Button type="button" variant="outline" onClick={() => setPriceDialogOpen(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={values.selling_price}
                  onChange={(e) => set("selling_price", e.target.value)}
                />
              )}
              {initial && (
                <p className="text-xs text-muted-foreground">
                  Price changes are recorded in the product history.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-warranty">Warranty (months)</Label>
              <Input
                id="p-warranty"
                type="number"
                min="0"
                max="120"
                required
                value={values.warranty_months}
                onChange={(e) => set("warranty_months", e.target.value)}
              />
            </div>
          </div>
          {!initial && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Stock starts at zero. After creating the product, record its first delivery under
              Inventory → Receive stock.
            </p>
          )}
          {initial && (
            <p className="text-xs text-muted-foreground">
              Current stock: {initial.stock_quantity} units — adjust via Inventory → Receive stock.
            </p>
          )}
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Feature cards</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("features", [...values.features, { title: "", description: "" }])}
            >
              <Plus className="size-4" /> Add feature
            </Button>
          </div>
          {values.features.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Up to three short highlights shown under the buy box.
            </p>
          )}
          {values.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1.6fr]">
                <Input
                  placeholder="Title"
                  value={feature.title}
                  onChange={(e) => {
                    const next = [...values.features];
                    next[i] = { ...next[i], title: e.target.value };
                    set("features", next);
                  }}
                />
                <Input
                  placeholder="Description"
                  value={feature.description}
                  onChange={(e) => {
                    const next = [...values.features];
                    next[i] = { ...next[i], description: e.target.value };
                    set("features", next);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove feature"
                onClick={() => set("features", values.features.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Variants</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set("variants", [...values.variants, { name: "", price: "" }])}
            >
              <Plus className="size-4" /> Add variant
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Optional style/color options. Leave price empty to inherit the base price.
          </p>
          {values.variants.map((variant, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Name (e.g. Midnight Black)"
                value={variant.name}
                onChange={(e) => {
                  const next = [...values.variants];
                  next[i] = { ...next[i], name: e.target.value };
                  set("variants", next);
                }}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price override"
                className="w-44"
                value={variant.price}
                onChange={(e) => {
                  const next = [...values.variants];
                  next[i] = { ...next[i], price: e.target.value };
                  set("variants", next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove variant"
                onClick={() => set("variants", values.variants.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Organization</h2>
          <div className="space-y-1.5">
            <Label>Collection</Label>
            <Select
              value={selectedParentId || undefined}
              onValueChange={(v) => {
                const firstChild = categories.find((c) => c.parent_id === Number(v));
                set("category_id", firstChild ? String(firstChild.id) : v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {subcategories.length > 0 && (
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select value={values.category_id || undefined} onValueChange={(v) => set("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={selectedParentId}>No subcategory</SelectItem>
                  {subcategories.map((child) => (
                    <SelectItem key={child.id} value={String(child.id)}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select value={values.brand_id || "none"} onValueChange={(v) => set("brand_id", v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="No brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No brand</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={values.currency || undefined} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger>
                <SelectValue placeholder={currencies[0] ? `${currencies[0].code}` : "No currencies"} />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} — {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {initial && values.currency && initial.currency !== values.currency && (
              <p className="text-xs text-muted-foreground">
                Keeps the same numeric price ({formatMoney(Number(initial.selling_price), values.currency)}) — the switch is recorded in price history.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["ACTIVE", "INACTIVE", "DISCONTINUED"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Badge</Label>
            <Select value={values.badge} onValueChange={(v) => set("badge", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="NEW_ARRIVAL">NEW_ARRIVAL</SelectItem>
                <SelectItem value="BEST_SELLER">BEST_SELLER</SelectItem>
                <SelectItem value="SALE">SALE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between pt-1 text-sm font-medium">
            Featured on homepage
            <Switch checked={values.is_featured} onCheckedChange={(checked) => set("is_featured", checked)} />
          </label>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {initial ? "Save changes" : "Create product"}
        </Button>
      </div>

      {/* Price change dialog */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePrice} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-price">New price</Label>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-reason">Reason</Label>
              <Textarea
                id="price-reason"
                rows={2}
                placeholder="e.g. Supplier cost increase"
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Update price</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  );
}
