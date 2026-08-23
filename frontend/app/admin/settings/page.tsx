"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, apiUpload } from "@/lib/api";
import { TESTIMONIALS } from "@/lib/testimonials";
import type { HeroContent, HomeContent } from "@/types";

const SCALAR_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "store_name", label: "Store name" },
  { key: "support_email", label: "Support email", type: "email" },
  { key: "support_phone", label: "Support phone" },
  { key: "shipping_cost", label: "Shipping cost", type: "number" },
  { key: "promo_code", label: "Promo code" },
  { key: "promo_percent", label: "Promo discount (%)", type: "number" },
];

// Bilingual hero copy — mirrored across the EN / AR columns.
const HERO_FIELDS: { key: keyof HeroContent; label: string; textarea?: boolean }[] = [
  { key: "badge", label: "Badge" },
  { key: "title_before", label: "Title (before accent)" },
  { key: "title_accent", label: "Title (accent word)" },
  { key: "title_after", label: "Title (after accent)" },
  { key: "subtitle", label: "Subtitle", textarea: true },
  { key: "cta", label: "CTA button" },
  { key: "explore", label: "Explore link" },
  { key: "image_alt", label: "Image alt text" },
  { key: "free_shipping", label: "Floating card title" },
  { key: "on_every_order", label: "Floating card line" },
];

type Locale = "en" | "ar";
type SectionKey = "hero" | "collections" | "promo" | "favorites" | "stories";
type Story = { name: string; location: string; rating: number; title: string; text: string };

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero banner",
  collections: "Collections",
  promo: "Promo banner",
  favorites: "Featured products",
  stories: "Customer stories",
};

const EMPTY_STORY: Story = { name: "", location: "", rating: 5, title: "", text: "" };

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string | number | null>>({});
  const [homeContent, setHomeContent] = useState<Record<Locale, HomeContent>>({ en: {}, ar: {} });
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    hero: true,
    collections: true,
    promo: true,
    favorites: true,
    stories: true,
  });
  const [stories, setStories] = useState<Record<Locale, Story[]>>({ en: [], ar: [] });
  // Which set the storefront renders: built-in defaults or the rows below.
  const [mode, setMode] = useState<"default" | "custom">("custom");
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi<{ data: Record<string, unknown> }>("/api/admin/settings")
      .then((res) => {
        const data = res.data;
        const scalars: Record<string, string | number | null> = {};
        for (const [key, value] of Object.entries(data)) {
          if (!["home_content", "testimonials", "home_sections"].includes(key)) {
            scalars[key] = value as string | number | null;
          }
        }
        setValues(scalars);

        const storedContent = (data.home_content ?? {}) as Partial<Record<Locale, HomeContent>>;
        setHomeContent({ en: storedContent.en ?? {}, ar: storedContent.ar ?? {} });
        setHeroImage(storedContent.en?.hero?.image ?? null);

        const storedSections = (data.home_sections ?? {}) as Partial<Record<SectionKey, boolean>>;
        setSections((prev) => ({ ...prev, ...storedSections }));

        const storedStories = (data.testimonials ?? {}) as Partial<Record<Locale, Story[]>>;
        setStories({ en: storedStories.en ?? [], ar: storedStories.ar ?? [] });

        const storedMode = (data.testimonials_mode as string | undefined) ?? "custom";
        setMode(storedMode === "default" ? "default" : "custom");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  function setScalar(key: string, value: string | number | null) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setHero(locale: Locale, key: keyof HeroContent, value: string) {
    // Hero copy lives under "<locale>.hero.*" — the storefront reads it from there.
    setHomeContent((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        hero: { ...prev[locale].hero, [key]: value === "" ? undefined : value },
      },
    }));
  }

  function setStory(locale: Locale, index: number, patch: Partial<Story>) {
    setStories((prev) => ({
      ...prev,
      [locale]: prev[locale].map((story, i) => (i === index ? { ...story, ...patch } : story)),
    }));
  }

  function addStory(locale: Locale) {
    setStories((prev) => ({ ...prev, [locale]: [...prev[locale], { ...EMPTY_STORY }] }));
  }

  function removeStory(locale: Locale, index: number) {
    setStories((prev) => ({ ...prev, [locale]: prev[locale].filter((_, i) => i !== index) }));
  }

  /** Seeds the editor with copies of the built-in stories so they can be tweaked. */
  function copyDefaults(locale: Locale) {
    setStories((prev) => ({ ...prev, [locale]: TESTIMONIALS[locale].map((s) => ({ ...s })) }));
    toast.info(`Copied ${TESTIMONIALS[locale].length} default rows — press Save to keep them`);
  }

  /** One click: switch to Custom and fill both languages with editable copies of the defaults. */
  function startFromDefaults() {
    setMode("custom");
    setStories({
      en: TESTIMONIALS.en.map((s) => ({ ...s })),
      ar: TESTIMONIALS.ar.map((s) => ({ ...s })),
    });
    toast.info("Default rows copied into both languages — edit them, then press Save");
  }

  async function handleHeroUpload(file: File | null) {
    if (!file) return;
    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiUpload<{ data: { image: string } }>("/api/admin/settings/hero-image", formData);
      // Keep local state in sync so saving text edits does not clobber the new image.
      setHeroImage(res.data.image);
      setHomeContent((prev) => ({
        en: { ...prev.en, hero: { ...prev.en.hero, image: res.data.image } },
        ar: { ...prev.ar, hero: { ...prev.ar.hero, image: res.data.image } },
      }));
      toast.success("Hero image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingHero(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  }

  async function handleHeroRemove() {
    setUploadingHero(true);
    try {
      await adminApi("/api/admin/settings/hero-image", { method: "DELETE" });
      setHeroImage(null);
      setHomeContent((prev) => ({
        en: { ...prev.en, hero: { ...prev.en.hero, image: undefined } },
        ar: { ...prev.ar, hero: { ...prev.ar.hero, image: undefined } },
      }));
      toast.success("Hero image removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploadingHero(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          ...values,
          home_content: homeContent,
          testimonials: stories,
          testimonials_mode: mode,
          home_sections: sections,
        }),
      });
      toast.success("Settings saved — storefront updates immediately");
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

      <form onSubmit={handleSave} className="max-w-5xl space-y-6">
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          {SCALAR_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`set-${field.key}`}>{field.label}</Label>
              <Input
                id={`set-${field.key}`}
                type={field.type}
                step={field.type === "number" ? "0.01" : undefined}
                min={field.type === "number" ? "0" : undefined}
                value={String(values[field.key] ?? "")}
                onChange={(e) => setScalar(field.key, e.target.value)}
              />
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="set-promo-title">Promo banner title (English)</Label>
            <Textarea
              id="set-promo-title"
              rows={2}
              placeholder="{percent} and {code} are filled in automatically"
              value={String(values.promo_title ?? "")}
              onChange={(e) => setScalar("promo_title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="set-promo-title-ar">Promo banner title (Arabic)</Label>
            <Textarea
              id="set-promo-title-ar"
              rows={2}
              dir="rtl"
              placeholder="{percent} و{code} يُملآن تلقائياً"
              value={String(values.promo_title_ar ?? "")}
              onChange={(e) => setScalar("promo_title_ar", e.target.value)}
            />
          </div>
        </Card>

        {/* Homepage sections visibility */}
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Homepage sections</h2>
          <p className="-mt-2 text-xs text-muted-foreground">
            Hidden sections disappear from the storefront home page entirely.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(SECTION_LABELS) as SectionKey[]).map((key) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium">
                {SECTION_LABELS[key]}
                <Switch
                  checked={sections[key]}
                  onCheckedChange={(checked) => setSections((prev) => ({ ...prev, [key]: checked }))}
                  aria-label={`Toggle ${SECTION_LABELS[key]} section`}
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Shared hero image */}
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Hero image</h2>
          <p className="-mt-2 text-xs text-muted-foreground">
            One shared picture for both languages. JPG, PNG, WebP, GIF or SVG · max 5MB. Without an
            upload, the built-in artwork is shown.
          </p>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage ?? "/hero.svg"}
              alt=""
              className="h-28 w-44 rounded-xl border border-border object-cover"
            />
            <input
              ref={heroFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="sr-only"
              onChange={(e) => handleHeroUpload(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" size="sm" disabled={uploadingHero} onClick={() => heroFileRef.current?.click()}>
                <ImagePlus className="size-4" /> {uploadingHero ? "Uploading…" : heroImage ? "Replace image" : "Upload image"}
              </Button>
              {heroImage && (
                <Button type="button" variant="ghost" size="sm" disabled={uploadingHero} onClick={handleHeroRemove}>
                  <Trash2 className="size-4" /> Remove
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Bilingual hero copy */}
        <div className="grid gap-6 lg:grid-cols-2">
          {(["en", "ar"] as Locale[]).map((locale) => (
            <Card key={locale} className="gap-4 p-5">
              <h2 className="text-sm font-semibold">
                Homepage hero copy — {locale === "en" ? "English" : "العربية"}
              </h2>
              <p className="-mt-2 text-xs text-muted-foreground">
                Empty fields fall back to the built-in translations.
              </p>
              {HERO_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`hero-${locale}-${field.key}`}>{field.label}</Label>
                  {field.textarea ? (
                    <Textarea
                      id={`hero-${locale}-${field.key}`}
                      rows={2}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      value={String(homeContent[locale].hero?.[field.key] ?? "")}
                      onChange={(e) => setHero(locale, field.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={`hero-${locale}-${field.key}`}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                      value={String(homeContent[locale].hero?.[field.key] ?? "")}
                      onChange={(e) => setHero(locale, field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </Card>
          ))}
        </div>

        {/* Customer stories: source switch + per-language editors */}
        <Card className="gap-4 p-5">
          <h2 className="text-sm font-semibold">Customer stories source</h2>
          <p className="-mt-2 text-xs text-muted-foreground">
            Built-in defaults shows the seeded reviews. Custom uses your rows below — if the rows
            are empty, the built-ins are shown instead.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-border p-1">
              <Button
                type="button"
                size="sm"
                variant={mode === "default" ? "default" : "ghost"}
                onClick={() => setMode("default")}
              >
                Built-in defaults
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "custom" ? "default" : "ghost"}
                onClick={() => setMode("custom")}
              >
                Custom
              </Button>
            </div>
            {mode === "custom" && (
              <Button type="button" size="sm" variant="outline" onClick={startFromDefaults}>
                Start from defaults
              </Button>
            )}
          </div>
          {mode === "default" && (
            <p className="text-xs font-medium text-amber-600">
              The storefront is currently ignoring your custom rows.
            </p>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {(["en", "ar"] as Locale[]).map((locale) => (
            <Card key={locale} className="gap-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">
                  Customer stories — {locale === "en" ? "English" : "العربية"}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title="Replaces the current rows with copies of the built-in defaults so you can tweak them"
                    onClick={() => copyDefaults(locale)}
                  >
                    Copy defaults
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addStory(locale)}>
                    <Plus className="size-4" /> Add story
                  </Button>
                </div>
              </div>
              {stories[locale].length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No custom stories — use “Copy defaults” to start from the built-in ones, or “Add
                  story” for a blank row.
                </p>
              )}
              {stories[locale].map((story, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-border p-4">
                  <div className="grid grid-cols-[1fr_1fr_88px] gap-3">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input value={story.name} onChange={(e) => setStory(locale, index, { name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Location</Label>
                      <Input value={story.location} onChange={(e) => setStory(locale, index, { location: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={story.rating}
                        onChange={(e) =>
                          setStory(locale, index, { rating: Math.min(5, Math.max(1, Number(e.target.value || 5))) })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input dir={locale === "ar" ? "rtl" : "ltr"} value={story.title} onChange={(e) => setStory(locale, index, { title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Text</Label>
                    <Textarea rows={3} dir={locale === "ar" ? "rtl" : "ltr"} value={story.text} onChange={(e) => setStory(locale, index, { text: e.target.value })} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStory(locale, index)}>
                    <Trash2 className="size-4" /> Remove story
                  </Button>
                </div>
              ))}
            </Card>
          ))}
        </div>

        <Button type="submit" disabled={saving}>
          Save settings
        </Button>
      </form>
    </div>
  );
}
