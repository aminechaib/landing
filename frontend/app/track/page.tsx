"use client";

import { useState } from "react";
import { Package, Search, ArrowDownToLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useI18n } from "@/lib/i18n";
import { API_URL } from "@/lib/api";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

type TrackData = {
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  total: number;
  currency: string;
  created_at: string;
  customer: { name: string; city: string | null };
  items: {
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-QA", { minimumFractionDigits: 2 }).format(amount) + " " + currency;
}

function StatusTimeline({ status }: { status: string }) {
  const { t } = useI18n();
  const isCancelled = status === "CANCELLED" || status === "RETURNED";
  const activeIndex = STATUSES.indexOf(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
        <span className="inline-block size-3 rounded-full bg-destructive" />
        <span className="text-sm font-medium text-destructive">{t(`track.steps.${status}`)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUSES.map((s, i) => {
        const reached = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <div key={s} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`inline-block size-3 rounded-full transition-colors ${
                  reached ? "bg-accent" : "bg-border"
                } ${isCurrent ? "ring-2 ring-accent/30" : ""}`}
              />
              {i < STATUSES.length - 1 && (
                <span className={`inline-block w-px h-6 ${reached ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
            <span
              className={`text-sm leading-8 ${
                isCurrent ? "font-semibold text-foreground" : reached ? "text-foreground/60" : "text-muted-foreground"
              }`}
            >
              {t(`track.steps.${s}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const { t } = useI18n();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `${API_URL}/api/orders/${encodeURIComponent(orderNumber.trim())}/track?phone=${encodeURIComponent(phone.trim())}`,
      );
      if (!res.ok) {
        setError(t("track.notFound"));
        return;
      }
      const json = await res.json();
      setData(json.data);
    } catch {
      setError(t("track.error"));
    } finally {
      setLoading(false);
    }
  }

  function handleReceipt() {
    if (!data) return;
    window.open(
      `${API_URL}/api/orders/${encodeURIComponent(data.order_number)}/receipt?phone=${encodeURIComponent(phone.trim())}`,
      "_blank",
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
              <Package className="size-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("track.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("track.description")}</p>
          </div>

          <form onSubmit={handleSearch} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="track-order">{t("track.orderNumber")}</Label>
              <Input
                id="track-order"
                placeholder="ORD-1001"
                required
                dir="ltr"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="track-phone">{t("track.phone")}</Label>
              <Input
                id="track-phone"
                type="tel"
                placeholder="+974 XXXX XXXX"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t("track.searching") : <><Search className="size-4" /> {t("track.submit")}</>}
            </Button>
          </form>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {data && (
            <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{t("track.status")}</h2>
                  <p className="text-sm text-muted-foreground">
                    #{data.order_number}
                  </p>
                </div>
                <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {t(`track.steps.${data.status}`)}
                </span>
              </div>

              <StatusTimeline status={data.status} />

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("track.date")}</span>
                  <p className="mt-0.5 font-medium">
                    {new Date(data.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("track.customer")}</span>
                  <p className="mt-0.5 font-medium">{data.customer.name}</p>
                </div>
                {data.customer.city && (
                  <div>
                    <span className="text-muted-foreground">{t("track.city")}</span>
                    <p className="mt-0.5 font-medium">{data.customer.city}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-muted-foreground">{t("track.items")}</h3>
                <div className="mt-2 space-y-2">
                  {data.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>
                        {item.product_name}
                        {item.variant_name ? ` — ${item.variant_name}` : ""} &times; {item.quantity}
                      </span>
                      <span className="font-medium">{formatMoney(item.total, data.currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("track.subtotal")}</span>
                    <span>{formatMoney(data.total, data.currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("track.shipping")}</span>
                    <span>{t("track.free")}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                    <span>{t("track.total")}</span>
                    <span>{formatMoney(data.total, data.currency)}</span>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleReceipt}>
                <ArrowDownToLine className="size-4" /> {t("track.receipt")}
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter settings={null} />
    </div>
  );
}

export const runtime = "nodejs";
void API_URL;
