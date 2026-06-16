"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

  const columns: { title: string; match: (s: string) => boolean }[] = [
    { title: "Pending", match: (s) => s === "pending" },
    { title: "Confirmed / Ready", match: (s) => s === "confirmed" || s === "ready" },
    { title: "Completed", match: (s) => s === "completed" || s === "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Queue</h1>
        <span className="text-xs text-muted-foreground">Auto-refreshes every 20s</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const list = orders?.filter((o) => col.match(o.status)) ?? [];
          return (
            <div key={col.title} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {col.title} {orders && `(${list.length})`}
              </h2>

              {!orders &&
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}

              {orders && list.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Nothing here
                </p>
              )}

              {list.map((o) => {
                const next = NEXT_STATUS[o.status];
                return (
                  <Card key={o.id}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between">
                        <Link href={`/orders/${o.id}`} className="font-semibold hover:underline">
                          {o.customerName}
                        </Link>
                        <Badge variant="outline" className="capitalize">{o.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.orderNumber} · {o.items.length} item
                        {o.items.length === 1 ? "" : "s"} · {timeSince(o.createdAt)}
                      </div>
                      {o.pickupNote && (
                        <div className="rounded bg-muted px-2 py-1 text-xs">
                          📝 {o.pickupNote}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold">{formatMoney(o.total)}</span>
                        {next && (
                          <Button size="sm" onClick={() => advance(o)}>
                            {next.label}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
