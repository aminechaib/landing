"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { StoreSettings } from "@/types";
import { useI18n } from "@/lib/i18n";

export function PromoBanner({ settings }: { settings: StoreSettings | null }) {
  const [copied, setCopied] = useState(false);
  const { t, locale } = useI18n();

  if (!settings) return null;

  const code = settings.promo_code ?? "PORTAGE10";
  const percent = settings.promo_percent ?? 10;
  // Server-stored titles are per-locale marketing copy; fall back to a localized default.
  const interpolate = (template: string) =>
    template.replace("{percent}", String(percent)).replace("{code}", code);
  const serverTitle =
    locale === "ar" ? settings.promo_title_ar : settings.promo_title;
  const title = serverTitle
    ? interpolate(serverTitle)
    : t("promo.defaultTitle", { percent, code });

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — code is visible anyway */
    }
  }

  return (
    <section className="bg-[#17140f] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:py-14">
        <div className="text-center lg:text-start">
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-[#d8b98a] uppercase">
            {t("promo.kicker")}
          </p>
          <h2 className="text-xl font-medium tracking-tight text-balance sm:text-2xl">
            {title}
          </h2>
        </div>

        <button
          onClick={copyCode}
          className="group inline-flex items-center gap-3 rounded-2xl border border-dashed border-[#b08d57]/70 bg-white/5 px-6 py-4 transition-colors hover:bg-white/10"
          aria-label={t("promo.copyAria", { code })}
        >
          <span className="text-lg font-semibold tracking-[0.3em]">{code}</span>
          {copied ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <Copy className="size-4 opacity-60 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </div>
    </section>
  );
}
