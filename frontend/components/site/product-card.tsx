"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { addItem, openCart } = useCart();
  const outOfStock = !product.in_stock;

  function handleQuickAdd() {
    if (outOfStock) return;
    addItem(
      {
        key: `${product.id}:0`,
        product_id: product.id,
        variant_id: null,
        product_name: product.name,
        variant_name: null,
        image: product.image,
        unit_price: Number(product.selling_price),
        currency: product.currency,
        max_qty: Math.max(1, Math.min(product.stock_quantity, 99)),
      },
      1,
    );
    toast(t("cart.addedToCart"), {
      action: { label: t("cart.viewCart"), onClick: () => openCart() },
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_40px_-18px_rgba(28,22,14,0.25)]">
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.name}
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-secondary to-accent-soft" />
          )}
          {product.badge && (
            <Badge
              variant={product.badge === "SALE" ? "sale" : "gold"}
              className="absolute top-3 left-3 backdrop-blur rtl:left-auto rtl:right-3"
            >
              {t(`badges.${product.badge}`)}
            </Badge>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1.5 text-center text-xs font-medium tracking-wide text-background uppercase">
              {t("badges.OUT_OF_STOCK")}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          {product.brand?.name && (
            <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              {product.brand.name}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm leading-snug font-medium sm:text-[15px]">
            {product.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="text-base font-semibold">
              {formatMoney(product.selling_price, product.currency)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                outOfStock ? "text-muted-foreground" : "text-foreground group-hover:text-accent",
              )}
            >
              {outOfStock ? t("badges.OUT_OF_STOCK") : t("badges.VIEW")}
              {!outOfStock && (
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
              )}
            </span>
          </div>
        </div>
      </Link>

      {!outOfStock && (
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={t("cart.addToCart")}
          className="absolute top-3 end-3 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95"
        >
          <Plus className="size-4" />
        </button>
      )}
    </div>
  );
}