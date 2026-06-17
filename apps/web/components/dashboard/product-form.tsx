"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

export interface CategoryOption {
  id: string;
  name: string;
  emoji: string | null;
}

export interface ProductFormValues {
  id?: string;
  name: string;
  price: string;
  categoryId?: string | null;
  description?: string | null;
  youtubeUrl?: string | null;
  inventoryQty: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isFeatured: boolean;
  tags: string[];
  imageUrl?: string | null;
}

const NONE = "__none__";

export function ProductForm({
  categories,
  initial,
}: {
  categories: CategoryOption[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? NONE);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [inventoryQty, setInventoryQty] = useState(String(initial?.inventoryQty ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initial?.lowStockThreshold ?? 5)
  );
  const [trackInventory, setTrackInventory] = useState(initial?.trackInventory ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const presign = await fetch("/api/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presign.ok) {
        const err = await presign.json().catch(() => ({}));
        toast({
          title: "Image upload unavailable",
          description: err?.error ?? "R2 not configured",
          variant: "destructive",
        });
        return;
      }
      const { uploadUrl, publicUrl } = await presign.json();
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("upload failed");
      setImageUrl(publicUrl);
      toast({ title: "Image uploaded", variant: "success" });
    } catch {
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/^\d+(\.\d{2})?$/.test(price)) {
      toast({
        title: "Check required fields",
        description: "Name and a price like 49.99 are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);

    const payload = {
      name: name.trim(),
      price,
      categoryId: categoryId === NONE ? undefined : categoryId,
      description: description || undefined,
      youtubeUrl: youtubeUrl || undefined,
      inventoryQty: parseInt(inventoryQty, 10) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      trackInventory,
      isFeatured,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ...(imageUrl ? { imageUrl } : {}),
    };

    const res = await fetch(
      initial?.id ? `/api/products/${initial.id}` : "/api/products",
      {
        method: initial?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (res.ok) {
      toast({ title: initial?.id ? "Product saved" : "Product created", variant: "success" });
      router.push("/dashboard/products");
      router.refresh();
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price * (e.g. 49.99)</Label>
          <Input
            id="price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Uncategorized" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="youtube">Video URL</Label>
        <Input
          id="youtube"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://player.vimeo.com/video/... or https://youtube.com/watch?v=..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="qty">Inventory qty</Label>
          <Input
            id="qty"
            type="number"
            value={inventoryQty}
            onChange={(e) => setInventoryQty(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="low">Low stock threshold</Label>
          <Input
            id="low"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={trackInventory}
            onChange={(e) => setTrackInventory(e.target.checked)}
          />
          Track inventory
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured
        </label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="bestseller, new, finale"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Image</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-muted-foreground">No image</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload image
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial?.id ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
