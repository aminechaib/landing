"use client";

import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useI18n } from "@/lib/i18n";

export function GuaranteeBar({ warrantyMonths }: { warrantyMonths: number }) {
  const { t } = useI18n();
  const warrantyTitle =
    warrantyMonths === 12
      ? t("guarantee.warranty.year")
      : t("guarantee.warranty.title", { months: warrantyMonths });

  const items = [
    {
      icon: Truck,
      title: t("guarantee.shipping.title"),
      text: t("guarantee.shipping.text"),
    },
    {
      icon: ShieldCheck,
      title: warrantyTitle,
      text: t("guarantee.warranty.text"),
    },
    {
      icon: RotateCcw,
      title: t("guarantee.returns.title"),
      text: t("guarantee.returns.text"),
    },
  ];

  return (
    <section className="border-y border-border bg-[#faf8f4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
              <item.icon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
