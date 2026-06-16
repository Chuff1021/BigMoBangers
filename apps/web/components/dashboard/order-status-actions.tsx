"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const FLOW: { label: string; status: string; variant?: "default" | "destructive" }[] = [
  { label: "Confirm", status: "confirmed" },
  { label: "Mark Ready", status: "ready" },
  { label: "Complete", status: "completed" },
  { label: "Cancel", status: "cancelled", variant: "destructive" },
];

export function OrderStatusActions({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (res.ok) {
      toast({ title: `Order marked ${status}`, variant: "success" });
      router.refresh();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FLOW.map((f) => (
        <Button
          key={f.status}
          variant={f.variant ?? "outline"}
          size="sm"
          disabled={busy || current === f.status}
          onClick={() => setStatus(f.status)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
