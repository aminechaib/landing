"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { computeTotals, useCart, type CartItem } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { t } = useI18n();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const {
    items,
    count,
    settings,
    cartOpen,
    closeCart,
    openCheckout,
    removeItem,
    setQuantity,
  } = useCart();

  const { subtotal, shippingCost, total } = computeTotals(items, settings, "");

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={cn(
          "overflow-hidden",
          isDesktop ? "" : "h-[85dvh] flex-col rounded-t-3xl",
        )}
      >
        <SheetHeader>
          <SheetTitle>
            {t("cart.title")}
            {count > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-5 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">{t("cart.empty")}</p>
            <Button variant="outline" size="sm" onClick={closeCart}>
              {t("order.close")}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5">
              {items.map((item) => (
                <CartRow
                  key={item.key}
                  item={item}
                  onRemove={() => removeItem(item.key)}
                  onQty={(q) => setQuantity(item.key, q)}
                />
              ))}
            </div>

            <div className="space-y-2 border-t border-border px-5 py-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span>{formatMoney(subtotal, items[0]?.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.shipping")}</span>
                  <span className={cn(shippingCost === 0 && "font-medium text-emerald-700")}>
                    {shippingCost > 0 ? formatMoney(shippingCost, items[0]?.currency) : t("cart.free")}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <span>{t("cart.total")}</span>
                  <span>{formatMoney(total, items[0]?.currency)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  closeCart();
                  openCheckout();
                }}
              >
                {t("cart.checkout")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartRow({
  item,
  onRemove,
  onQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onQty: (quantity: number) => void;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.product_name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-accent-soft" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.product_name}</p>
            {item.variant_name && (
              <p className="text-xs text-muted-foreground">{item.variant_name}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Remove"
            onClick={onRemove}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-input bg-card">
            <button
              type="button"
              aria-label="-"
              onClick={() => onQty(item.quantity - 1)}
              className="flex size-8 items-center justify-center rounded-s-lg hover:bg-secondary disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              aria-label="+"
              onClick={() => onQty(item.quantity + 1)}
              className="flex size-8 items-center justify-center rounded-e-lg hover:bg-secondary disabled:opacity-40"
              disabled={item.quantity >= item.max_qty}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold">
            {formatMoney(item.unit_price * item.quantity, item.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}