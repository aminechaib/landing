"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { StoreSettings } from "@/types";

export function Hero({ settings }: { settings: StoreSettings | null }) {
  const { t, locale } = useI18n();
  const scrollToShop = () => {
    document.getElementById("favorites")?.scrollIntoView({ behavior: "smooth" });
  };

  // Server-stored bilingual copy wins; built-in translations are the fallback.
  const c = settings?.home?.[locale]?.hero;
  const pick = (key: Parameters<typeof t>[0], server?: string) =>
    server ?? t(key);

  return (
    <section className="relative overflow-hidden">
      {/* Soft champagne glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full opacity-60 blur-3xl rtl:right-auto rtl:left-[-10%]"
        style={{ background: "radial-gradient(closest-side, #efe4cd, transparent)" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pt-20 lg:pb-24">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1.5 text-xs font-medium tracking-widest text-[#8a6d3f]">
            {pick("hero.badge", c?.badge)}
          </p>
          <h1 className="text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.2rem]">
            {pick("hero.titleA", c?.title_before)}
            <span className="text-[#b08d57]">{pick("hero.titleAccent", c?.title_accent)}</span>
            {pick("hero.titleB", c?.title_after)}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {pick("hero.subtitle", c?.subtitle)}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={scrollToShop} className="px-9 tracking-wide">
              {pick("hero.cta", c?.cta)}
            </Button>
            <a
              href="#collections"
              className="text-sm font-medium text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {pick("hero.explore", c?.explore)}
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative order-1 lg:order-2">
          <div className="overflow-hidden rounded-[2rem] border border-border shadow-[0_40px_80px_-40px_rgba(28,22,14,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c?.image ?? "/hero.svg"}
              alt={pick("hero.imgAlt", c?.image_alt)}
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/11]"
            />
          </div>
          {/* Floating accent card */}
          <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-lg backdrop-blur sm:block rtl:left-auto rtl:right-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {pick("hero.freeShipping", c?.free_shipping)}
            </p>
            <p className="text-sm font-semibold">{pick("hero.onEveryOrder", c?.on_every_order)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
