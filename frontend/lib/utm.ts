import type { UtmPayload } from "@/types";

const STORAGE_KEY = "utm_params";

const SOURCE_MAP: Record<string, string> = {
  instagram: "INSTAGRAM",
  facebook: "FACEBOOK",
  fb: "FACEBOOK",
  snapchat: "SNAPCHAT",
  tiktok: "TIKTOK",
  google: "GOOGLE",
  whatsapp: "WHATSAPP",
};

/**
 * Capture UTM parameters from the landing URL and persist them for the
 * whole visit (sessionStorage). Call once on the storefront layout.
 */
export function captureUtm(): void {
  if (typeof window === "undefined") return;

  const search = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  const found: Record<string, string> = {};
  for (const key of keys) {
    const value = search.get(key);
    if (value) found[key] = value.slice(0, 120);
  }

  // Also accept a plain ?ref=instagram style link from ads.
  const ref = search.get("ref");
  if (ref && !found.utm_source) found.utm_source = ref.slice(0, 120);

  if (Object.keys(found).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  }
}

/** UTM payload to merge into the order request. */
export function utmOrderFields(): UtmPayload {
  if (typeof window === "undefined") return {};

  let params: Record<string, string> = {};
  try {
    params = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    params = {};
  }

  const source = (params.utm_source ?? "").toLowerCase();
  const known = SOURCE_MAP[source];

  return {
    source: known ?? (source ? "OTHER" : "DIRECT"),
    ...params,
  };
}
