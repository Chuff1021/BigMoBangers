"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

type Reason = "manual_add" | "manual_remove" | "adjustment";

export function InventoryControls({
  productId,
  qty,
}: {
  productId: string;
  qty: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState<Reason>("adjustment");

  async function adjust(qtyChange: number, r: Reason, note?: string) {
    if (qtyChange === 0) return;
    setBusy(true);
    const res = await fetch(`/api/inventory/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qtyChange, reason: r, note }),
    });
    setBusy(false);
    if (res.ok) {
      toast({ title: "Inventory updated", variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Adjustment failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        disabled={busy || qty <= 0}
        onClick={() => adjust(-1, "manual_remove")}
        aria-label="Decrease"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        disabled={busy}
        onClick={() => adjust(1, "manual_add")}
        aria-label="Increase"
      >
        <Plus className="h-3 w-3" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="ml-1 h-7">
            Adjust
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="delta">Quantity change (use a negative to remove)</Label>
              <Input
                id="delta"
                type="number"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as Reason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_add">Manual add</SelectItem>
                  <SelectItem value="manual_remove">Manual remove</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                disabled={busy}
                onClick={() => {
                  const n = parseInt(delta, 10);
                  if (!Number.isNaN(n)) adjust(n, reason);
                }}
              >
                Apply
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
