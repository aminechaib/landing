"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const outOfStock = !product.in_stock;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_40px_-18px_rgba(28,22,14,0.25)]"
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
  );
}
