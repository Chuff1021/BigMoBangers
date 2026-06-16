"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatMoney, timeSince } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: string;
  status: string;
  pickupNote: string | null;
  createdAt: string;
  items: OrderItem[];
}

const NEXT_STATUS: Record<string, { label: string; status: string } | null> = {
  pending: { label: "Confirm", status: "confirmed" },
  confirmed: { label: "Mark Ready", status: "ready" },
  ready: { label: "Complete", status: "completed" },
  completed: null,
  cancelled: null,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load orders");
      setOrders(await res.json());
    } catch {
      toast({ title: "Could not load orders", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  async function advance(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next.status }),
    });
    if (res.ok) {
      toast({ title: `Order ${order.orderNumber} → ${next.status}`, variant: "success" });
      load();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  const columns: { title: string; accent: string; match: (s: string) => boolean }[] = [
    { title: "Pending", accent: "text-gold", match: (s) => s === "pending" },
    { title: "Confirmed / Ready", accent: "text-electric", match: (s) => s === "confirmed" || s === "ready" },
    { title: "Completed", accent: "text-muted-foreground", match: (s) => s === "completed" || s === "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-wider text-rwb">ORDER QUEUE</h1>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand" /> Auto-refresh 20s
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const list = orders?.filter((o) => col.match(o.status)) ?? [];
          return (
            <div key={col.title} className="space-y-3">
              <h2 className={`font-display text-lg tracking-wide ${col.accent}`}>
                {col.title} {orders && `· ${list.length}`}
              </h2>

              {!orders &&
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full bg-white/5" />
                ))}

              {orders && list.length === 0 && (
                <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-muted-foreground">
                  Nothing here
                </p>
              )}

              {list.map((o) => {
                const next = NEXT_STATUS[o.status];
                return (
                  <div key={o.id} className="glass space-y-2 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/dashboard/orders/${o.id}`}
                        className="font-semibold text-white hover:text-electric"
                      >
                        {o.customerName}
                      </Link>
                      <Badge variant="outline" className="capitalize">{o.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {o.orderNumber} · {o.items.length} item
                      {o.items.length === 1 ? "" : "s"} · {timeSince(o.createdAt)}
                    </div>
                    {o.pickupNote && (
                      <div className="rounded bg-white/5 px-2 py-1 text-xs text-muted-foreground">
                        📝 {o.pickupNote}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-display text-lg tracking-wide text-gold">
                        {formatMoney(o.total)}
                      </span>
                      {next && (
                        <Button size="sm" variant="brand" onClick={() => advance(o)}>
                          {next.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
