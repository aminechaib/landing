"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { StoreSettings } from "@/types";

export function PromoBanner({ settings }: { settings: StoreSettings | null }) {
  const [copied, setCopied] = useState(false);
  const code = settings?.promo_code ?? "PORTAGE10";
  const percent = settings?.promo_percent ?? 10;
  const title = settings?.promo_title ?? `Instagram Exclusive — Extra ${percent}% Off with Code ${code}`;

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
        <div className="text-center lg:text-left">
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-[#d8b98a] uppercase">
            Instagram Exclusive
          </p>
          <h2 className="text-xl font-medium tracking-tight text-balance sm:text-2xl">
            {title}
          </h2>
        </div>

        <button
          onClick={copyCode}
          className="group inline-flex items-center gap-3 rounded-2xl border border-dashed border-[#b08d57]/70 bg-white/5 px-6 py-4 transition-colors hover:bg-white/10"
          aria-label={`Copy discount code ${code}`}
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
