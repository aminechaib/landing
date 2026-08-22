"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Store logo.
 * Drop the official PNG at `frontend/public/logo.png` and it will be used
 * automatically. Until then a clean neutral placeholder is rendered.
 */
export function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={cn(
        "relative inline-flex h-9 items-center justify-center overflow-hidden",
        className,
      )}
      aria-label="Store logo"
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="Store logo"
          className="max-h-9 w-auto object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden
          className="inline-block h-9 w-[104px] rounded-lg border border-dashed border-border bg-card"
        />
      )}
    </span>
  );
}
