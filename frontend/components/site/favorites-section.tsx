"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

export function FavoritesSection({
  products,
  categories,
  loading,
  activeCategory,
  onCategoryChange,
}: {
  products: Product[];
  categories: Category[];
  loading: boolean;
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) {
  const { t } = useI18n();

  const filtered = useMemo(() => {
    if (!activeCategory) return products.filter((p) => p.is_featured);
    return products.filter(
      (p) =>
        p.category?.slug === activeCategory ||
        p.category?.parent_id ===
          categories.find((c) => c.slug === activeCategory)?.id,
    );
  }, [products, categories, activeCategory]);

  const chips = [
    { slug: null, label: t("favorites.all") },
    ...categories.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <section id="favorites" className="scroll-mt-20 bg-[#faf8f4]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          kicker={t("favorites.kicker")}
          title={t("favorites.title")}
          description={t("favorites.description")}
        />

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onCategoryChange(chip.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                activeCategory === chip.slug
                  ? "border-accent bg-accent-soft text-[#8a6d3f]"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("favorites.empty")}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {filtered.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
