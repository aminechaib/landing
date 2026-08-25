"use client";

import { useI18n } from "@/lib/i18n";

const DEFAULT_ITEMS = {
  ar: [
    "شحن مجاني",
    "ضمان رسمي",
    "الدفع عند الاستلام",
    "إرجاع خلال 30 يوماً",
    "منتجات أصلية",
    "خدمة عملاء متميزة",
  ],
  en: [
    "Free Shipping",
    "Official Warranty",
    "Cash on Delivery",
    "30-Day Returns",
    "Authentic Products",
    "Premium Support",
  ],
};

export function MarqueeStrip() {
  const { locale } = useI18n();
  const items = DEFAULT_ITEMS[locale] ?? DEFAULT_ITEMS.en;

  return (
    <section className="relative overflow-hidden border-y border-border bg-background py-5">
      {/* Edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent sm:w-40 rtl:left-auto rtl:right-0 rtl:bg-gradient-to-l"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent sm:w-40 rtl:right-auto rtl:left-0 rtl:bg-gradient-to-r"
      />

      {/* Scrolling track — duplicated for seamless loop */}
      <div className="flex w-max animate-marquee gap-8 rtl:animate-marquee-rtl">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-3 text-sm font-medium tracking-wide text-muted-foreground select-none"
          >
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            {item}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(-33.333%); }
          to { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 24s linear infinite;
        }
      `}</style>
    </section>
  );
}
