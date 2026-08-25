"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { CollectionsSection } from "@/components/site/collections-section";
import { FavoritesSection } from "@/components/site/favorites-section";
import { Hero } from "@/components/site/hero";
import { MarqueeStrip } from "@/components/site/marquee-strip";
import { PromoBanner } from "@/components/site/promo-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { api, API_URL } from "@/lib/api";
import { captureUtm } from "@/lib/utm";
import type { Category, Product, StoreSettings } from "@/types";

function HeroSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pt-20 lg:pb-24">
      <div className="order-2 space-y-5 lg:order-1">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-5 w-64" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-14 w-36 rounded-xl" />
          <Skeleton className="h-14 w-36 rounded-xl" />
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <Skeleton className="aspect-[16/11] rounded-[2rem]" />
      </div>
    </section>
  );
}

function PromoSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-12 sm:px-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-6 w-72" />
      </div>
      <Skeleton className="h-14 w-44 rounded-2xl" />
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <Skeleton className="mx-auto h-3 w-28" />
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    captureUtm();
    let cancelled = false;

    Promise.all([
      api<{ data: Product[] }>("/api/products?per_page=24"),
      api<{ data: Category[] }>("/api/categories"),
      api<{ data: StoreSettings }>("/api/settings").catch(() => null),
    ])
      .then(([productsRes, categoriesRes, settingsRes]) => {
        if (cancelled) return;
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setSettings(settingsRes?.data ?? null);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, []);

  const handleSelectCollection = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {loading ? (
          <>
            <HeroSkeleton />
            <PromoSkeleton />
            <MarqueeStrip />
            <FavoritesSkeleton />
          </>
        ) : (
          <>
            {settings?.sections?.hero ?? true ? <Hero settings={settings} /> : null}
            {settings?.sections?.collections ?? true ? (
              <CollectionsSection categories={categories} onSelect={handleSelectCollection} />
            ) : null}
            {settings?.sections?.promo ?? true ? <PromoBanner settings={settings} /> : null}
            <MarqueeStrip />
            {settings?.sections?.favorites ?? true ? (
              <FavoritesSection
                products={products}
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            ) : null}
            {settings?.sections?.stories ?? true ? (
              <TestimonialsSection settings={settings} />
            ) : null}

            <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-8 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Popular:</span>
                {products.slice(0, 6).map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="hover:text-accent">
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}

export const runtime = "nodejs";
void API_URL;
