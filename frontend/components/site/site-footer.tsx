"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/site/logo";
import {
  InstagramIcon,
  SnapchatIcon,
  TiktokIcon,
  XBrandIcon,
} from "@/components/site/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { StoreSettings } from "@/types";

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-accent/60 hover:text-accent"
    >
      {children}
    </a>
  );
}

export function SiteFooter({ settings }: { settings: StoreSettings | null }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await api<{ message: string }>("/api/newsletter", {
        method: "POST",
        body: { email },
      });
      toast.success(t("footer.subscribed"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("footer.subscribeFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer id="support" className="border-t border-border bg-[#faf8f4]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand + newsletter */}
          <div className="space-y-5 lg:col-span-2">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <InstagramIcon className="size-4" />
              </SocialIcon>
              <SocialIcon href="https://snapchat.com" label="Snapchat">
                <SnapchatIcon className="size-3.5" />
              </SocialIcon>
              <SocialIcon href="https://tiktok.com" label="TikTok">
                <TiktokIcon className="size-3.5" />
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X">
                <XBrandIcon className="size-3.5" />
              </SocialIcon>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase">{t("footer.newsletterTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.newsletterText")}
            </p>
            <form onSubmit={subscribe} className="flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder={t("footer.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label={t("order.emailOptional")}
              />
              <Button type="submit" disabled={busy}>
                {busy ? "…" : t("footer.subscribe")}
              </Button>
            </form>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold tracking-wide uppercase">{t("nav.support")}</h3>
            <p className="text-muted-foreground" dir="ltr">{settings?.support_email ?? "support@example.com"}</p>
            <p className="text-muted-foreground" dir="ltr">{settings?.support_phone ?? "+1 555 010 2030"}</p>
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground/70">
              {t("footer.builtWith")}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t("footer.hours")}
          </p>
        </div>
      </div>
    </footer>
  );
}
