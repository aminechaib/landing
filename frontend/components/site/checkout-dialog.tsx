"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BadgeCheck,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api, ApiError, API_URL } from "@/lib/api";
import { computeTotals, useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { useMediaQuery } from "@/lib/use-media-query";
import { utmOrderFields } from "@/lib/utm";
import { cn } from "@/lib/utils";
import type { OrderConfirmation } from "@/types";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  discount_code: "",
};

export function CheckoutDialog() {
  const {
    items,
    settings,
    checkoutOpen,
    closeCheckout,
    removeItem,
    setQuantity,
    clear,
  } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const { t } = useI18n();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const totals = useMemo(
    () => computeTotals(items, settings, form.discount_code),
    [items, settings, form.discount_code],
  );

  const currency = items[0]?.currency ?? "QAR";

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /** Close + forget the previous flow so the next checkout starts clean. */
  function handleClose() {
    closeCheckout();
    setConfirmation(null);
    setForm(emptyForm);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || items.length === 0) return;

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
        customer: {
          first_name: form.name.trim(),
          last_name: "",
          phone: form.phone.trim(),
          address: form.address.trim(),
        },
        discount_code: totals.codeValid ? form.discount_code.trim() : undefined,
        ...utmOrderFields(),
      };

      const res = await api<{ message: string; data: OrderConfirmation }>("/api/orders", {
        method: "POST",
        body: payload,
      });
      clear();
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
    <Sheet open={checkoutOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={cn(
          "overflow-hidden",
          isDesktop ? "" : "h-[92dvh] flex-col rounded-t-3xl",
        )}
      >
        {confirmation ? (
          <SuccessView confirmation={confirmation} phone={form.phone} onClose={handleClose} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-5 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">{t("cart.empty")}</p>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t("order.close")}
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{t("order.title")}</SheetTitle>
            </SheetHeader>

            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
                {/* Order items */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-card">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.product_name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product_name}</p>
                        {item.variant_name && (
                          <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-input bg-card">
                            <button
                              type="button"
                              aria-label="-"
                              onClick={() => setQuantity(item.key, item.quantity - 1)}
                              className="flex size-6 items-center justify-center rounded-s-md hover:bg-secondary disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="+"
                              onClick={() => setQuantity(item.key, item.quantity + 1)}
                              className="flex size-6 items-center justify-center rounded-e-md hover:bg-secondary disabled:opacity-40"
                              disabled={item.quantity >= item.max_qty}
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={t("cart.remove")}
                            onClick={() => removeItem(item.key)}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          <span className="ml-auto text-xs font-semibold">
                            {formatMoney(item.unit_price * item.quantity, item.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact form: minimum required */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cd-name">{t("order.name")} *</Label>
                    <Input
                      id="cd-name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cd-phone">{t("order.phone")} *</Label>
                    <Input
                      id="cd-phone"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+1 555 010 2030"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cd-address">{t("order.address")} *</Label>
                    <Input
                      id="cd-address"
                      required
                      maxLength={500}
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft/60 p-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
                  <div className="text-sm">
                    <p className="font-medium">{t("order.paymentTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("order.paymentText")}</p>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 rounded-xl border border-border p-4 text-sm">
                  <Row label={t("order.subtotal")} value={formatMoney(totals.subtotal, currency)} />
                  <Row
                    label={t("order.shipping")}
                    value={
                      totals.shippingCost > 0
                        ? formatMoney(totals.shippingCost, currency)
                        : t("order.free")
                    }
                    accent={totals.shippingCost === 0}
                  />
                  {totals.codeValid && (
                    <Row
                      label={t("order.discount", { percent: totals.promoPercent, code: totals.promoCode ?? "" })}
                      value={`−${formatMoney(totals.discount, currency)}`}
                      accent
                    />
                  )}
                  {!totals.codeValid && (
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
                    <span>{formatMoney(totals.total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Sticky submit */}
              <div className="border-t border-border p-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {t("order.placing")}
                    </>
                  ) : (
                    `${t("order.place")} · ${formatMoney(totals.total, currency)}`
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
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
  phone,
  onClose,
}: {
  confirmation: OrderConfirmation;
  phone: string;
  onClose: () => void;
}) {
  const { t } = useI18n();

  function handleReceipt() {
    window.open(
      `${API_URL}/api/orders/${encodeURIComponent(confirmation.order_number)}/receipt?phone=${encodeURIComponent(phone.trim())}`,
      "_blank",
    );
  }

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-50">
        <BadgeCheck className="size-9 text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{t("order.successTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("order.successBody")}</p>

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

      <Button variant="outline" className="mt-4 w-full" onClick={handleReceipt}>
        <ArrowDownToLine className="size-4" /> {t("order.downloadReceipt")}
      </Button>

      <Button onClick={onClose} className="mt-2 w-full" size="lg">
        {t("order.continueShopping")}
      </Button>
    </div>
  );
}