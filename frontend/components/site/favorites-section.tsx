"use client";

import { useMemo } from "react";

import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { useI18n } from "@/lib/i18n";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types";

export function FavoritesSection({
  products,
  categories,
  activeCategory,
  onCategoryChange,
}: {
  products: Product[];
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) {
  const { t } = useI18n();
  const { ref: gridRef, visible: gridVisible } = useInView({ once: true, threshold: 0.05 });
  const { ref: chipsRef, visible: chipsVisible } = useInView({ once: true, threshold: 0.1 });

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
        <div ref={chipsRef} className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip, i) => (
            <button
              key={chip.label}
              onClick={() => onCategoryChange(chip.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                activeCategory === chip.slug
                  ? "border-accent bg-accent-soft text-[#8a6d3f]"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
              style={{
                transitionDelay: chipsVisible ? `${i * 50 + 60}ms` : "0ms",
                opacity: chipsVisible ? 1 : 0,
                transform: chipsVisible ? "translateY(0)" : "translateY(12px)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("favorites.empty")}
          </p>
        ) : (
          <div ref={gridRef} className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {filtered.slice(0, 8).map((product, i) => (
              <div
                key={product.id}
                className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transitionDelay: gridVisible ? `${i * 80 + 100}ms` : "0ms",
                  opacity: gridVisible ? 1 : 0,
                  transform: gridVisible ? "translateY(0)" : "translateY(24px)",
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
