"use client";

import { ReferenceCrudPage } from "@/components/admin/reference-crud";

export default function SuppliersPage() {
  return (
    <ReferenceCrudPage resource="suppliers" title="Suppliers" description="Vendors that ship inventory batches." />
  );
}
