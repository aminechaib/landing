"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { GuaranteeBar } from "@/components/site/guarantee-bar";
import { OrderDialog } from "@/components/site/order-dialog";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StarRating } from "@/components/site/star-rating";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, API_URL } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { captureUtm } from "@/lib/utm";
import { cn } from "@/lib/utils";
import type { ProductDetail, StoreSettings } from "@/types";

export function ProductView({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const { t, locale } = useI18n();

  useEffect(() => {
    captureUtm();
    let cancelled = false;

    Promise.all([
      api<{ data: ProductDetail }>(`/api/products/${slug}`),
      api<{ data: StoreSettings }>("/api/settings").catch(() => null),
    ])
      .then(([productRes, settingsRes]) => {
        if (cancelled) return;
        setProduct(productRes.data);
        setSettings(settingsRes?.data ?? null);
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const variant = useMemo(
    () => product?.variants.find((v) => v.id === variantId) ?? null,
    [product, variantId],
  );

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <SiteHeader />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-5 py-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-lg font-medium">{t("product.notAvailable")}</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t("product.backToStore")}
          </Link>
        </Button>
      </div>
    );
  }

  const price = variant?.price ?? product.selling_price;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <Breadcrumbs
            items={[
              { label: t("product.home"), href: "/" },
              ...(product.category
                ? [{ label: product.category.name }]
                : []),
              { label: product.name },
            ]}
          />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
          {/* Gallery */}
          <div>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[activeImage]?.url ?? product.images[0]?.url}
                alt={product.images[activeImage]?.alt_text ?? product.name}
                className="aspect-square w-full object-cover"
              />
              {product.badge && (
                <Badge
                  variant={product.badge === "SALE" ? "sale" : "gold"}
                  className="absolute top-4 left-4 backdrop-blur rtl:left-auto rtl:right-4"
                >
                  {t(`badges.${product.badge}`)}
                </Badge>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {product.images.map((image, i) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      "overflow-hidden rounded-xl border-2 transition-all",
                      activeImage === i
                        ? "border-accent shadow-sm"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:py-2">
            {product.brand?.name && (
              <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground uppercase">
                {product.brand.name}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={5} />
              <span className="text-xs text-muted-foreground">{t("product.storiesHint")}</span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {formatMoney(price, product.currency)}
            </p>

            {product.description && (
              <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.description}
              </p>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 text-xs font-semibold tracking-widest uppercase">
                  {t("product.styleLabel")} — <span className="font-normal normal-case tracking-normal text-muted-foreground">{variant?.name ?? t("product.selectStyle")}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
                        variantId === v.id
                          ? "border-accent bg-accent-soft text-[#8a6d3f] shadow-[0_0_0_1px_var(--accent)]"
                          : "border-border bg-card text-foreground/80 hover:border-accent/50",
                      )}
                    >
                      {v.name}
                      {v.price !== null && v.price !== product.selling_price && (
                        <span className="ml-2 text-xs text-muted-foreground rtl:ml-0 rtl:mr-2">
                          {formatMoney(v.price, product.currency)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 space-y-3">
              <Button
                size="lg"
                disabled={!product.in_stock}
                onClick={() => {
                  if (!variant && product.variants.length > 0) {
                    // Default to the first style so ordering is one tap away.
                    setVariantId(product.variants[0].id);
                  }
                  setOrderOpen(true);
                }}
                className="h-14 w-full text-base font-semibold tracking-wider ring-1 ring-accent/40 hover:ring-accent"
              >
                {product.in_stock ? t("product.orderNow") : t("badges.OUT_OF_STOCK")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {product.in_stock ? t("product.stockInfo", { count: product.stock_quantity }) : t("product.outOfStockLine")}
                {product.warranty_months > 0 &&
                  ` · ${product.warranty_months === 12 ? t("product.warrantyYear") : t("product.warrantyMonths", { months: product.warranty_months })}`}
              </p>
            </div>

            {/* Feature cards */}
            {product.features.length > 0 && (
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {product.features.slice(0, 3).map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
                  >
                    <h3 className="text-xs font-semibold tracking-wide uppercase">{feature.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <GuaranteeBar warrantyMonths={product.warranty_months} content={settings?.home?.[locale]?.guarantees} />
        <TestimonialsSection settings={settings} />
      </main>

      <SiteFooter settings={settings} />

      <OrderDialog
        product={product}
        variant={variant}
        settings={settings}
        open={orderOpen}
        onOpenChange={setOrderOpen}
      />
    </div>
  );
}
