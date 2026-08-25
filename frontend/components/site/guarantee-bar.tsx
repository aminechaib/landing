"use client";

import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import type { GuaranteeContent } from "@/types";

export function GuaranteeBar({
  warrantyMonths,
  content,
}: {
  warrantyMonths: number;
  content?: GuaranteeContent;
}) {
  const { t } = useI18n();

  const shipping = content?.shipping;
  const warranty = content?.warranty;
  const returns = content?.returns;

  const warrantyTitle =
    (warrantyMonths === 12
      ? (warranty?.title ?? t("guarantee.warranty.year"))
      : (warranty?.title ?? t("guarantee.warranty.title"))
    ).replace("{months}", String(warrantyMonths));

  const items = [
    {
      icon: Truck,
      title: shipping?.title ?? t("guarantee.shipping.title"),
      text: shipping?.text ?? t("guarantee.shipping.text"),
    },
    {
      icon: ShieldCheck,
      title: warrantyTitle,
      text: warranty?.text ?? t("guarantee.warranty.text"),
    },
    {
      icon: RotateCcw,
      title: returns?.title ?? t("guarantee.returns.title"),
      text: returns?.text ?? t("guarantee.returns.text"),
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
