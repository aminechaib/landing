"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/shared";
import { adminApi } from "@/lib/api";
import type { AdminCategory, Brand, Currency } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    Promise.all([
      adminApi<{ data: AdminCategory[] }>("/api/admin/categories"),
      adminApi<{ data: Brand[] }>("/api/admin/brands"),
      adminApi<{ data: Currency[] }>("/api/admin/currencies"),
    ])
      .then(([c, b, cur]) => {
        setCategories(c.data);
        setBrands(b.data);
        setCurrencies(cur.data);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <PageHeader title="Add product" description="Create a new catalog item." />
      <ProductForm categories={categories} brands={brands} currencies={currencies} />
    </div>
  );
}
