"use client";

import { useEffect, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { clearAdminToken, getAdminToken, verifyAdminSession } from "@/lib/api";

type GateState = "checking" | "authed" | "guest" | "offline";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>("checking");
  const [attempt, setAttempt] = useState(0);

  // The login page must never be blocked by its own gate.
  const isPublicPage = pathname === "/admin/login";

  useEffect(() => {
    if (isPublicPage) return;

    let cancelled = false;

    // No token at all -> straight to login.
    if (!getAdminToken()) {
      setState("guest");
      router.replace("/admin/login");
      return;
    }

    // Token present -> prove it is valid before rendering anything.
    verifyAdminSession().then(({ ok, reachable }) => {
      if (cancelled) return;
      if (ok) {
        setState("authed");
      } else if (reachable) {
        // Backend answered: token is invalid/expired — drop it and re-login.
        clearAdminToken();
        setState("guest");
        router.replace("/admin/login");
      } else {
        // Backend unreachable: keep the token (it may still be valid),
        // offer a retry instead of bouncing the user around.
        setState("offline");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, attempt, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (state === "offline") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <WifiOff className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Cannot reach the server</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setState("checking");
            setAttempt((n) => n + 1);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Until the session is verified, render nothing of the console —
  // no shell, no chrome, no data. A neutral spinner only.
  if (state !== "authed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
