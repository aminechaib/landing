"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Loader2, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { utmOrderFields } from "@/lib/utm";
import type {
  OrderConfirmation,
  ProductDetail,
  ProductVariant,
  StoreSettings,
} from "@/types";

type Props = {
  product: ProductDetail;
  variant: ProductVariant | null;
  settings: StoreSettings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const emptyForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  notes: "",
  discount_code: "",
};

export function OrderDialog({ product, variant, settings, open, onOpenChange }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const { t } = useI18n();

  // Reset each time the dialog opens for a fresh order flow.
  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setQuantity(1);
      setConfirmation(null);
    }
  }, [open]);

  const unitPrice = Number(variant?.price ?? product.selling_price);
  const subtotal = unitPrice * quantity;
  const shippingCost = settings?.shipping_cost ?? 0;

  const promoCode = settings?.promo_code;
  const promoPercent = settings?.promo_percent ?? 0;
  const codeValid =
    !!form.discount_code &&
    !!promoCode &&
    form.discount_code.trim().toUpperCase() === promoCode.toUpperCase() &&
    promoPercent > 0;
  const discount = codeValid ? Math.round(subtotal * promoPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  const maxQty = useMemo(() => Math.max(1, Math.min(product.stock_quantity, 99)), [product.stock_quantity]);

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        items: [
          {
            product_id: product.id,
            variant_id: variant?.id ?? null,
            quantity,
          },
        ],
        customer: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim(),
          city: form.city.trim(),
        },
        notes: form.notes.trim() || undefined,
        discount_code: codeValid ? form.discount_code.trim() : undefined,
        ...utmOrderFields(),
      };

      const res = await api<{ message: string; data: OrderConfirmation }>("/api/orders", {
        method: "POST",
        body: payload,
      });
      setConfirmation(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.firstError());
      } else {
        toast.error(t("order.failed"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {confirmation ? (
          <SuccessView confirmation={confirmation} onClose={() => onOpenChange(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("order.title")}</DialogTitle>
              <DialogDescription>
                {t("order.paymentText")}
              </DialogDescription>
            </DialogHeader>

            {/* Product summary */}
            <div className="flex gap-4 rounded-xl border border-border bg-muted/40 p-3">
              <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-card">
                {product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                {variant && <p className="text-xs text-muted-foreground">{variant.name}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-input bg-card">
                    <button
                      type="button"
                      aria-label="-"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex size-8 items-center justify-center rounded-s-lg hover:bg-secondary disabled:opacity-40"
                      disabled={quantity <= 1}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      type="button"
                      aria-label="+"
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      className="flex size-8 items-center justify-center rounded-e-lg hover:bg-secondary disabled:opacity-40"
                      disabled={quantity >= maxQty}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatMoney(unitPrice * quantity, product.currency)}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">{t("order.firstName")} *</Label>
                  <Input id="first_name" required maxLength={100} value={form.first_name} onChange={(e) => set("first_name", e.target.value)} autoComplete="given-name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">{t("order.lastName")} *</Label>
                  <Input id="last_name" required maxLength={100} value={form.last_name} onChange={(e) => set("last_name", e.target.value)} autoComplete="family-name" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t("order.phone")} *</Label>
                  <Input id="phone" required inputMode="tel" placeholder="+1 555 010 2030" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("order.emailOptional")}</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">{t("order.address")} *</Label>
                <Input id="address" required maxLength={500} value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">{t("order.city")} *</Label>
                <Input id="city" required maxLength={120} value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">{t("order.notes")}</Label>
                <Textarea id="notes" rows={2} maxLength={2000} placeholder={t("order.notes")} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>

              {/* Payment method */}
              <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft/60 p-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
                <div className="text-sm">
                  <p className="font-medium">{t("order.paymentTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("order.paymentText")}
                  </p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 rounded-xl border border-border p-4 text-sm">
                <Row label={`Subtotal (${quantity} × ${formatMoney(unitPrice, product.currency)})`} value={formatMoney(subtotal, product.currency)} />
                <Row label={t("order.shipping")} value={shippingCost > 0 ? formatMoney(shippingCost, product.currency) : t("order.free")} accent={shippingCost === 0} />
                {codeValid && (
                  <Row label={t("order.discount", { percent: promoPercent, code: promoCode })} value={`−${formatMoney(discount, product.currency)}`} accent />
                )}
                {!codeValid && (
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder={t("order.promoCode")}
                      value={form.discount_code}
                      onChange={(e) => set("discount_code", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t border-border pt-2.5 text-base font-semibold">
                  <span>{t("order.total")}</span>
                  <span>{formatMoney(total, product.currency)}</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full tracking-wide" disabled={submitting || !product.in_stock}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> {t("order.placing")}
                  </>
                ) : (
                  t("order.place")
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Truck className="size-3 rtl:-scale-x-100" /> {t("order.successBody")}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-medium text-emerald-700" : ""}>{value}</span>
    </div>
  );
}

function SuccessView({
  confirmation,
  onClose,
}: {
  confirmation: OrderConfirmation;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-50">
        <BadgeCheck className="size-9 text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{t("order.successTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("order.successBody")}
      </p>

      <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("order.orderNumber")}</span>
          <span className="font-semibold" dir="ltr">#{confirmation.order_number}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-muted-foreground">{t("order.payOnDelivery")}</span>
          <span className="font-semibold">{formatMoney(confirmation.total, confirmation.currency)}</span>
        </div>
      </div>

      <Button onClick={onClose} className="mt-6 w-full" size="lg">
        {t("order.continueShopping")}
      </Button>
    </div>
  );
}
