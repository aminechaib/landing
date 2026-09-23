export type LabelSize = { width: number; height: number }; // inches

export type LabelSections = "store" | "barcode" | "customer" | "items" | "summary" | "support";

export type LabelConfig = {
  size: "preset" | "custom";
  width: number;
  height: number;
  fontSize: "sm" | "md" | "lg";
  sections: LabelSections[];
};

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  size: "preset",
  width: 2,
  height: 3,
  fontSize: "md",
  sections: ["store", "customer", "items", "summary", "support"],
};

export const LABEL_SIZE_PRESETS = [
  { id: "2x3", label: "2 × 3 in", width: 2, height: 3 },
  { id: "2x3to4", label: "2.25 × 3.5 in", width: 2.25, height: 3.5 },
  { id: "2x4", label: "2 × 4 in", width: 2, height: 4 },
  { id: "4x6", label: "4 × 6 in", width: 4, height: 6 },
] as const;

export const LABEL_SECTIONS: Record<LabelSections, { label: string; hint: string }> = {
  store: { label: "Store name", hint: "Store name and order number at the top." },
  barcode: { label: "Barcode", hint: "Scannable stripe + order number." },
  customer: { label: "Customer", hint: "Name, phone and delivery address." },
  items: { label: "Items", hint: "Quantity and product names." },
  summary: { label: "Payment", hint: "Payment method and amount to collect." },
  support: { label: "Support line", hint: "Store support phone footer." },
};

export const LABEL_FONT_SIZES = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
] as const;

const ORDER = ["store", "barcode", "customer", "items", "summary", "support"] as const;

/**
 * Sanitizes an unknown JSON payload coming from the settings endpoint into a
 * valid LabelConfig, filling any missing or invalid field with the default.
 */
export function normalizeLabelConfig(raw: unknown): LabelConfig {
  const cfg = (raw ?? {}) as Partial<Record<string, unknown>>;

  const fontSize = cfg.fontSize === "sm" || cfg.fontSize === "lg" ? cfg.fontSize : "md";

  const preset = LABEL_SIZE_PRESETS.find(
    (p) => Math.abs(p.width - Number(cfg.width ?? DEFAULT_LABEL_CONFIG.width)) < 0.01 && Math.abs(p.height - Number(cfg.height ?? DEFAULT_LABEL_CONFIG.height)) < 0.01,
  );

  const width = clampInches(Number(cfg.width) || DEFAULT_LABEL_CONFIG.width);
  const height = clampInches(Number(cfg.height) || DEFAULT_LABEL_CONFIG.height);

  const sections = Array.isArray(cfg.sections)
    ? [...new Set(cfg.sections.filter((s): s is LabelSections => ORDER.includes(s as LabelSections)))]
    : [...DEFAULT_LABEL_CONFIG.sections];

  return {
    size: preset ? "preset" : "custom",
    width,
    height,
    fontSize,
    sections,
  };
}

function clampInches(v: number) {
  if (!Number.isFinite(v)) return 2;
  return Math.min(8, Math.max(1, Number(v.toFixed(2))));
}