"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { CollectionsSection } from "@/components/site/collections-section";
import { FavoritesSection } from "@/components/site/favorites-section";
import { Hero } from "@/components/site/hero";
import { PromoBanner } from "@/components/site/promo-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { api, API_URL } from "@/lib/api";
import { captureUtm } from "@/lib/utm";
import type { Category, Product, StoreSettings } from "@/types";

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
      .catch(() => {
        /* keep empty states; footer still renders */
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectCollection = useCallback((slug: string) => {
    setActiveCategory(slug);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Section visibility is admin-controlled; a missing flag means visible. */}
        {settings?.sections?.hero ?? true ? <Hero settings={settings} /> : null}
        {settings?.sections?.collections ?? true ? (
          <CollectionsSection categories={categories} onSelect={handleSelectCollection} />
        ) : null}
        {settings?.sections?.promo ?? true ? <PromoBanner settings={settings} /> : null}
        {settings?.sections?.favorites ?? true ? (
          <FavoritesSection
            products={products}
            categories={categories}
            loading={loading}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        ) : null}
        {settings?.sections?.stories ?? true ? <TestimonialsSection settings={settings} /> : null}

        {/* SEO / crawlability strip */}
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
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}

export const runtime = "nodejs";
void API_URL;
