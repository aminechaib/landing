import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5 text-xs sm:text-[13px]", className)}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50 rtl:-scale-x-100" />}
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label.toUpperCase()}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label.toUpperCase()}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
