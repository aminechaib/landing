"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { adminApi, apiUpload } from "@/lib/api";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showInCollections, setShowInCollections] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ data: Category[] }>("/api/admin/categories");
      setRows(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Revoke object URLs so previews do not leak memory.
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile(f: File | null) {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setShowInCollections(true);
    pickFile(null);
    setOpen(true);
  }

  function openEdit(row: Category) {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setShowInCollections(row.show_in_collections ?? true);
    pickFile(null);
    setOpen(true);
  }

  async function toggleInCollections(row: Category, show: boolean) {
    try {
      await adminApi(`/api/admin/categories/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: row.name,
          description: row.description ?? null,
          show_in_collections: show,
        }),
      });
      toast.success(show ? "Shown in collections" : "Hidden from collections");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function uploadImageIfPicked(id: number) {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await apiUpload(`/api/admin/categories/${id}/image`, formData);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !file) {
      toast.error("Pick an image for the storefront collection");
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        show_in_collections: showInCollections,
      });
      let id: number;
      if (editing) {
        await adminApi(`/api/admin/categories/${editing.id}`, { method: "PUT", body });
        id = editing.id;
        toast.success("Saved");
      } else {
        const created = await adminApi<{ data: Category }>("/api/admin/categories", { method: "POST", body });
        id = created.data.id;
        toast.success("Created");
      }
      await uploadImageIfPicked(id);
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveImage() {
    if (!editing) return;
    try {
      await adminApi(`/api/admin/categories/${editing.id}/image`, { method: "DELETE" });
      toast.success("Image removed");
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Product taxonomy shown in storefront collections."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> New
          </Button>
        }
      />

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No categories yet." />
      ) : (
        <Card className="gap-0 p-0 pb-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="text-center">In collections</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={row.image} alt="" className="size-10 rounded-lg border border-border object-cover" />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                        <ImagePlus className="size-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="hidden max-w-72 truncate text-muted-foreground sm:table-cell">
                    {row.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={row.show_in_collections ?? true}
                      onCheckedChange={(checked) => toggleInCollections(row, checked)}
                      aria-label={`Toggle ${row.name} in storefront collections`}
                    />
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
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <label className="flex items-center justify-between text-sm font-medium">
              Show in storefront collections
              <Switch checked={showInCollections} onCheckedChange={setShowInCollections} />
            </label>
            <div className="space-y-1.5">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {previewUrl || editing?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl ?? editing!.image!}
                    alt=""
                    className="size-20 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <span className="flex size-20 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
                    <ImagePlus className="size-5" />
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="size-4" /> {file ? "Change file" : "Upload image"}
                  </Button>
                  {file && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => pickFile(null)}>
                      <Trash2 className="size-4" /> Undo selection
                    </Button>
                  )}
                  {!file && editing?.image && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage}>
                      <Trash2 className="size-4" /> Remove current
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF or SVG · max 5MB.</p>
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
