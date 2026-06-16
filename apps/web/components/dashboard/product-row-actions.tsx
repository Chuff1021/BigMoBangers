"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export function ProductRowActions({
  id,
  isFeatured,
  isActive,
}: {
  id: string;
  isFeatured: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      toast({ title: label, variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function remove() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      toast({ title: "Product deleted", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={busy}
        onClick={() => patch({ isFeatured: !isFeatured }, "Featured updated")}
      >
        <Badge variant={isFeatured ? "warning" : "outline"} className="cursor-pointer">
          {isFeatured ? "★ Featured" : "Feature"}
        </Badge>
      </button>
      <button
        disabled={busy}
        onClick={() => patch({ isActive: !isActive }, "Visibility updated")}
      >
        <Badge variant={isActive ? "success" : "secondary"} className="cursor-pointer">
          {isActive ? "Active" : "Hidden"}
        </Badge>
      </button>
      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
        <Link href={`/dashboard/products/${id}`} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-destructive"
        disabled={busy}
        onClick={remove}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
