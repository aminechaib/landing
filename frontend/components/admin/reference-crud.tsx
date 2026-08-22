"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";

export interface ReferenceRecord {
  id: number;
  name: string;
  description?: string | null;
}

export function ReferenceCrudPage({
  resource,
  title,
  description,
  extraColumns,
}: {
  resource: string; // e.g. "categories"
  title: string;
  description: string;
  extraColumns?: { key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }[];
}) {
  const [rows, setRows] = useState<ReferenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ReferenceRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ data: ReferenceRecord[] }>(`/api/admin/${resource}`);
      setRows(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setName("");
    setRecordDescription("");
    setOpen(true);
  }

  function openEdit(row: ReferenceRecord) {
    setEditing(row);
    setName(row.name);
    setRecordDescription(row.description ?? "");
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = JSON.stringify({ name: name.trim(), description: recordDescription.trim() || null });
      if (editing) {
        await adminApi(`/api/admin/${resource}/${editing.id}`, { method: "PUT", body });
        toast.success("Saved");
      } else {
        await adminApi(`/api/admin/${resource}`, { method: "POST", body });
        toast.success("Created");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> New
          </Button>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} yet.`} />
      ) : (
        <Card className="gap-0 p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {extraColumns?.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  {extraColumns?.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(row as unknown as Record<string, unknown>) : String((row as never)[column.key] ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="hidden max-w-72 truncate text-muted-foreground sm:table-cell">
                    {row.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label={`Edit ${row.name}`} onClick={() => openEdit(row)}>
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.toLowerCase().replace(/s$/, "")}` : `New ${title.toLowerCase().replace(/s$/, "")}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ref-name">Name</Label>
              <Input id="ref-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref-desc">Description</Label>
              <Textarea
                id="ref-desc"
                rows={3}
                value={recordDescription}
                onChange={(e) => setRecordDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
