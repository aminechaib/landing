"use client";

import { ReferenceCrudPage } from "@/components/admin/reference-crud";

export default function CategoriesPage() {
  return (
    <ReferenceCrudPage
      resource="categories"
      title="Categories"
      description="Product taxonomy shown in storefront collections."
    />
  );
}
