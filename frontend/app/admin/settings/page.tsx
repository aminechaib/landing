"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import type { StoreSettings } from "@/types";

const FIELDS: { key: keyof StoreSettings; label: string; type?: string }[] = [
  { key: "store_name", label: "Store name" },
  { key: "support_email", label: "Support email" },
  { key: "support_phone", label: "Support phone" },
  { key: "shipping_cost", label: "Shipping cost (USD)", type: "number" },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Partial<StoreSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi<{ data: StoreSettings }>("/api/admin/settings")
      .then((res) => setValues(res.data))
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      toast.success("Settings saved — storefront updates on next load");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Store configuration used across the storefront and checkout."
      />

      <form onSubmit={handleSave} className="max-w-xl">
        <Card className="gap-4 p-5">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`set-${field.key}`}>{field.label}</Label>
              <Input
                id={`set-${field.key}`}
                type={field.type}
                step={field.type === "number" ? "0.01" : undefined}
                min={field.type === "number" ? "0" : undefined}
                value={String(values[field.key] ?? "")}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="set-promo-code">Promo code</Label>
            <Input
              id="set-promo-code"
              value={String(values.promo_code ?? "")}
              onChange={(e) => setValues((prev) => ({ ...prev, promo_code: e.target.value }))}
              placeholder="Empty disables the promo"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-promo-percent">Promo discount (%)</Label>
            <Input
              id="set-promo-percent"
              type="number"
              min="0"
              max="90"
              value={String(values.promo_percent ?? 0)}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, promo_percent: Number(e.target.value || 0) }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-promo-title">Promo banner title</Label>
            <Textarea
              id="set-promo-title"
              rows={2}
              value={String(values.promo_title ?? "")}
              onChange={(e) => setValues((prev) => ({ ...prev, promo_title: e.target.value }))}
              placeholder="Falls back to a default banner copy when empty"
            />
          </div>

          <Button type="submit" disabled={saving}>
            Save settings
          </Button>
        </Card>
      </form>

      <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
        The promo code is validated server-side at order time; customers see it as an optional field
        during checkout.
      </p>
    </div>
  );
}
