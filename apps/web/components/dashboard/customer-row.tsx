"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

interface CustomerSummary {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  totalOrders: number;
  totalSpent: string;
  lastOrderAt: string | null;
}

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  items: { id: string; productName: string; quantity: number }[];
}

export function CustomerRow({ customer }: { customer: CustomerSummary }) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && orders === null) {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${customer.id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <TableRow className="cursor-pointer" onClick={toggle}>
        <TableCell>
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-medium">{customer.name}</TableCell>
        <TableCell>{customer.phone ?? "—"}</TableCell>
        <TableCell>{customer.email ?? "—"}</TableCell>
        <TableCell className="text-right tabular-nums">{customer.totalOrders}</TableCell>
        <TableCell className="text-right">{formatMoney(customer.totalSpent)}</TableCell>
        <TableCell>
          {customer.lastOrderAt
            ? new Date(customer.lastOrderAt).toLocaleDateString()
            : "—"}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/40">
            {loading && <div className="p-3 text-sm text-muted-foreground">Loading…</div>}
            {!loading && orders && orders.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No orders yet.</div>
            )}
            {!loading && orders && orders.length > 0 && (
              <div className="space-y-2 p-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-md border bg-background p-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{o.orderNumber}</span>{" "}
                      <span className="text-muted-foreground">
                        · {o.items.length} item{o.items.length === 1 ? "" : "s"} ·{" "}
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{o.status}</Badge>
                      <span className="font-semibold">{formatMoney(o.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
