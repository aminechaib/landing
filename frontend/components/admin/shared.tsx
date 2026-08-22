import { Card } from "@/components/ui/card";
import type { Paginated } from "@/types";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="gap-1 p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Pagination({
  page,
  onPage,
}: {
  page: Paginated<unknown> | null;
  onPage: (page: number) => void;
}) {
  if (!page || page.last_page <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-muted-foreground">
        Showing {page.from ?? 0}–{page.to ?? 0} of {page.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-border bg-background px-3 py-1.5 disabled:opacity-40"
          disabled={page.current_page <= 1}
          onClick={() => onPage(page.current_page - 1)}
        >
          Previous
        </button>
        <span className="px-2 tabular-nums">
          {page.current_page} / {page.last_page}
        </span>
        <button
          className="rounded-md border border-border bg-background px-3 py-1.5 disabled:opacity-40"
          disabled={page.current_page >= page.last_page}
          onClick={() => onPage(page.current_page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
