"use client";

import { useCallback, useEffect, useState } from "react";
import { GripVertical, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { ShippingLabel } from "@/components/admin/label";
import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/api";
import {
  DEFAULT_LABEL_CONFIG,
  LABEL_FONT_SIZES,
  LABEL_SECTIONS,
  LABEL_SIZE_PRESETS,
  normalizeLabelConfig,
  type LabelConfig,
  type LabelSections,
} from "@/lib/label";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types";

const pxPerInch = 96;

const MOCK_ORDER = {
  id: 1,
  order_number: "ORD-10457",
  status: "PENDING",
  payment_method: "CASH",
  payment_status: "PAID",
  shipping_method: "Same-day delivery",
  shipping_status: "PENDING",
  subtotal: 180,
  shipping_cost: 15,
  discount: 0,
  discount_code: null,
  total: 195,
  currency: "QAR",
  source: "storefront",
  utm: {},
  customer_notes: null,
  internal_notes: null,
  created_at: "2026-09-22T10:30:00Z",
  invoice: null,
  payments: [],
  paid_total: 195,
  customer: {
    id: 7,
    name: "Amina Al-Sayed",
    phone: "+974 5123 4567",
    email: "amina@example.com",
    address: "Building 12, Al Nasr St",
    city: "Doha",
  },
  items: [
    {
      id: 1,
      product_name: "Brake Pad Set",
      variant_name: "Front",
      sku: "BP-101",
      product_slug: "brake-pad-set",
      quantity: 2,
      unit_price: 90,
      total: 180,
      warranty_months: 12,
      warranty: null,
    },
  ],
};

function mm(fraction: number) {
  return Math.round(fraction * 25.4);
}

export default function LabelBuilderPage() {
  const [config, setConfig] = useState<LabelConfig>(DEFAULT_LABEL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi<{ data: Partial<StoreSettings> }>("/api/admin/settings");
      setConfig(normalizeLabelConfig(res.data.label_settings));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load label settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      await load();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function patch(p: Partial<LabelConfig>) {
    setConfig((prev) => ({ ...prev, ...p }));
  }

  function setDimensions(width: number, height: number) {
    setConfig((prev) => ({ ...prev, width, height, size: "custom" }));
  }

  function toggleSection(section: LabelSections) {
    setConfig((prev) => {
      const visible = prev.sections.includes(section);
      const sections = visible
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section];
      return { ...prev, sections };
    });
  }

  function moveSection(from: number, to: number) {
    if (from === to) return;
    setConfig((prev) => {
      const sections = [...prev.sections];
      const [moved] = sections.splice(from, 1);
      sections.splice(to, 0, moved);
      return { ...prev, sections };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await adminApi<{ message: string }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ label_settings: config }),
      });
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save label settings");
    } finally {
      setSaving(false);
    }
  }

  const zoom = Math.min(0.6, 320 / (config.width * pxPerInch));

  return (
    <div>
      <PageHeader
        title="Label builder"
        description="Design the sticky delivery label — size, which blocks appear, and their order."
        actions={
          <>
            <Button variant="outline" onClick={() => setConfig(DEFAULT_LABEL_CONFIG)}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button onClick={save} disabled={saving || loading}>
              <Save className="size-4" /> {saving ? "Saving…" : "Save label"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Preview */}
        <div>
          <Card className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <>
                <div
                  className="mx-auto"
                  style={{
                    width: `${config.width}in`,
                    height: `${config.height}in`,
                    zoom,
                  }}
                >
                  <ShippingLabel order={MOCK_ORDER} store={{ store_name: "Portage", support_phone: "+974 4411 2233" }} config={config} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {config.width} × {config.height} in · {mm(config.width)} × {mm(config.height)} mm ·{' '}
                  scaled preview, printed at 100%
                </p>
              </>
            )}
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-semibold">Label size</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {LABEL_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, size: "preset", width: preset.width, height: preset.height }))}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      config.size === "preset" && Math.abs(config.width - preset.width) < 0.01 && Math.abs(config.height - preset.height) < 0.01
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="lb-width" className="text-xs text-muted-foreground">
                    Width (in)
                  </Label>
                  <Input
                    id="lb-width"
                    type="number"
                    min={1}
                    max={8}
                    step={0.25}
                    value={config.width}
                    onChange={(e) => setDimensions(Number(e.target.value) || 2, config.height)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lb-height" className="text-xs text-muted-foreground">
                    Height (in)
                  </Label>
                  <Input
                    id="lb-height"
                    type="number"
                    min={1}
                    max={8}
                    step={0.25}
                    value={config.height}
                    onChange={(e) => setDimensions(config.width, Number(e.target.value) || 3)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Font size</span>
                <Select
                  value={config.fontSize}
                  onValueChange={(v) => patch({ fontSize: v as LabelConfig["fontSize"] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_FONT_SIZES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-1 text-sm font-semibold">Blocks & order</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Drag to reorder, toggle to show or hide.
            </p>
            <ul className="space-y-2">
              {config.sections.map((section, idx) => (
                <li
                  key={section}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragIdx !== null && dragIdx !== idx) {
                      moveSection(dragIdx, idx);
                      setDragIdx(idx);
                    }
                  }}
                  onDragEnd={() => setDragIdx(null)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2",
                    dragIdx === idx && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    aria-label={`Move ${LABEL_SECTIONS[section].label}`}
                  >
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{LABEL_SECTIONS[section].label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{LABEL_SECTIONS[section].hint}</span>
                    </span>
                  </button>
                  <Switch checked onCheckedChange={() => toggleSection(section)} aria-label={`Hide ${LABEL_SECTIONS[section].label}`} />
                </li>
              ))}
            </ul>

            {config.sections.length < Object.keys(LABEL_SECTIONS).length && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Hidden blocks</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(LABEL_SECTIONS) as LabelSections[])
                    .filter((s) => !config.sections.includes(s))
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSection(s)}
                        className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        + {LABEL_SECTIONS[s].label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}