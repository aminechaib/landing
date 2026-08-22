import type { Metadata } from "next";

import { ProductView } from "@/components/site/product-view";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  let title = "Product";
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      title = json.data?.name ?? title;
    }
  } catch {
    /* API offline — fall back to default title */
  }
  return { title };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  return <ProductView slug={slug} />;
}
