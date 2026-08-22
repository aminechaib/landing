"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const next: Locale = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(next)}
      aria-label={t("lang.switch")}
      className={`gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground ${className ?? ""}`}
    >
      <Languages className="size-4" />
      {t("lang.switch")}
    </Button>
  );
}
