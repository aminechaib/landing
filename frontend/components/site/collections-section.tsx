"use client";

import { SectionHeading } from "@/components/site/section-heading";
import { useI18n } from "@/lib/i18n";
import type { Category } from "@/types";

// Shown while a category has no uploaded image yet.
const FALLBACKS = ["/collections/wearables.svg", "/collections/audio.svg", "/collections/home.svg"];

export function CollectionsSection({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (slug: string) => void;
}) {
  const { t } = useI18n();

  return (
    <section id="collections" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          kicker={t("collections.kicker")}
          title={t("collections.title")}
          description={t("collections.description")}
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {categories.map((category, i) => {
            const name = category.name;
            const tagline = category.description ?? "";
            const image = category.image ?? FALLBACKS[i % FALLBACKS.length];

            return (
              <button
                key={category.slug}
                onClick={() => {
                  onSelect(category.slug);
                  document.getElementById("favorites")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative overflow-hidden rounded-3xl border border-border text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_50px_-24px_rgba(28,22,14,0.35)] ${
                  i === 0 ? "sm:col-span-2 sm:aspect-[2/1] lg:col-span-1 lg:aspect-auto" : ""
                } aspect-[4/3]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-wide text-white">{name}</h3>
                    {tagline && <p className="mt-0.5 text-sm text-white/70">{tagline}</p>}
                  </div>
                  <span className="flex size-9 items-center justify-center rounded-full border border-white/40 text-white transition-all group-hover:border-accent group-hover:bg-accent rtl:-scale-x-100">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
