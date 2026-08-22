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

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>("/api/newsletter", {
        method: "POST",
        body: { email },
      });
      toast.success(res.message);
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
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
              Premium electronics, curated for your lifestyle. Fast delivery,
              genuine warranty and human support.
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
            <h3 className="text-sm font-semibold tracking-wide uppercase">Sign Up for Offers</h3>
            <p className="text-sm text-muted-foreground">
              New arrivals and exclusive deals, straight to your inbox.
            </p>
            <form onSubmit={subscribe} className="flex max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button type="submit" disabled={busy}>
                {busy ? "…" : "Sign Up"}
              </Button>
            </form>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold tracking-wide uppercase">Support</h3>
            <p className="text-muted-foreground">{settings?.support_email ?? "support@example.com"}</p>
            <p className="text-muted-foreground">{settings?.support_phone ?? "+1 555 010 2030"}</p>
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground/70">
              Cash on Delivery available.<br />
              Free shipping on every order.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings?.store_name ?? "Portage"} Electronics. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Terms · Privacy · Warranty Policy
          </p>
        </div>
      </div>
    </footer>
  );
}
