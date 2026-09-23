"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";
import type { Category, Product, ProductListResponse } from "@/types";

const PAGE_SIZE = 8;

export function FavoritesSection({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) {
  const { t, locale } = useI18n();
  // The grid stays mounted at all times so its reveal observer never detaches.
  const { ref: gridRef, visible: gridVisible } = useInView({ once: true, threshold: 0.05 });
  const { ref: chipsRef, visible: chipsVisible } = useInView({ once: true, threshold: 0.1 });

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Generation counter: bumped on every reset so stale responses (e.g. a
  // "load more" that resolves after a new search) are discarded.
  const generationRef = useRef(0);

  // Debounce the search box so we don't hammer the API on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 350);
    return () => window.clearTimeout(id);
  }, [query]);

  // (Re)load the first page whenever the category, search term, or retry changes.
  useEffect(() => {
    let cancelled = false;
    const generation = ++generationRef.current;

    const run = async () => {
      // Yield first so the reset state changes never fire synchronously
      // inside the effect body.
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setProducts([]);
      setTotal(0);
      setPage(1);
      setLastPage(1);
      setError(false);

      try {
        const res = await api<ProductListResponse>(
          `/api/products?${buildParams(1, activeCategory, debounced)}`,
        );
        if (cancelled || generation !== generationRef.current) return;
        setProducts(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debounced, reloadKey]);

  async function loadMore() {
    if (loadingMore || page >= lastPage) return;
    const generation = generationRef.current;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await api<ProductListResponse>(
        `/api/products?${buildParams(next, activeCategory, debounced)}`,
      );
      if (generation !== generationRef.current) return;
      setProducts((prev) => [...prev, ...res.data]);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
      setPage(next);
    } catch {
      // non-fatal: the Load more button stays available to retry
    } finally {
      setLoadingMore(false);
    }
  }

  const chips = [
    { slug: null, label: t("favorites.all") },
    ...categories.map((c) => ({
      slug: c.slug,
      label: locale === "ar" && c.name_ar ? c.name_ar : c.name,
    })),
  ];

  const hasMore = page < lastPage;

  return (
    <section id="favorites" className="scroll-mt-20 bg-[#faf8f4]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          kicker={t("favorites.kicker")}
          title={t("favorites.title")}
          description={t("favorites.description")}
        />

        {/* Search */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("favorites.search")}
              className="h-11 rounded-full border-border bg-card ps-11 pe-11 shadow-sm"
              aria-label={t("favorites.search")}
            />
            {query !== "" && (
              <button
                type="button"
                aria-label={t("favorites.clearSearch")}
                onClick={() => setQuery("")}
                className="absolute top-1/2 end-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div ref={chipsRef} className="mt-6 flex flex-wrap items-center justify-center gap-2">
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

        {/* Grid — always mounted so the reveal observer stays attached even
            while the first page is still loading. */}
        <div ref={gridRef} className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {loading && products.length === 0 ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary/60" />
            ))
          ) : (
            products.map((product, i) => (
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
            ))
          )}
        </div>

        {!loading && error && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">{t("favorites.error")}</p>
            <Button size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              {t("favorites.retry")}
            </Button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            {t("favorites.empty")}
          </p>
        )}

        {!loading && !error && products.length > 0 && hasMore && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
              className="h-12 px-10 text-sm font-semibold"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {t("favorites.loadingMore")}
                </>
              ) : (
                t("favorites.loadMore")
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {products.length} / {total}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function buildParams(page: number, category: string | null, search: string): string {
  const params = new URLSearchParams({
    per_page: String(PAGE_SIZE),
    page: String(page),
  });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  // With no filter active, the section shows the featured picks. Searching
  // however searches the whole catalog so nothing is ever unreachable.
  else if (!search) params.set("featured", "1");
  return params.toString();
}