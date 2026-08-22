"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminToken } from "@/lib/api";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();

  useEffect(() => {
    // Login page is public; every other /admin route requires a token.
    if (!getAdminToken()) {
      router.replace("/admin/login");
    }
  }, [router]);

  return <AdminShell>{children}</AdminShell>;
}
