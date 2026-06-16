"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  lineTotal: string;
}
interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
  pickupNote: string | null;
  items: OrderItem[];
}

const STATUS: Record<string, string> = {
  pending: "bg-white/10 text-white",
  confirmed: "bg-electric/20 text-electric",
  ready: "bg-emerald-500/20 text-emerald-300",
  completed: "bg-white/10 text-muted-foreground",
  cancelled: "bg-brand/20 text-brand",
};

export default function OrdersLookupPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  async function lookup() {
    if (phone.trim().length < 7) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/lookup?tenant=bigmos&phone=${encodeURIComponent(phone.trim())}`,
        { cache: "no-store" }
      );
      setOrders(res.ok ? await res.json() : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wider text-rwb">MY ORDERS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your phone number to track your pickup. (Demo: try{" "}
          <button onClick={() => setPhone("417-555-2210")} className="text-electric underline">
            417-555-2210
          </button>
          )
        </p>
      </div>

      <div className="glass flex items-center gap-2 rounded-xl p-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="Your phone number"
          className="w-full bg-transparent px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={lookup}
          className="glow-red flex items-center gap-2 rounded-lg bg-brand px-5 py-2 font-bold text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Find
        </button>
      </div>

      {orders && orders.length === 0 && (
        <p className="text-center text-muted-foreground">No orders found for that number.</p>
      )}

      <div className="space-y-3">
        {orders?.map((o) => (
          <button
            key={o.id}
            onClick={() => setOpen(open === o.id ? null : o.id)}
            className="glass block w-full rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-wide text-white">{o.orderNumber}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS[o.status] ?? STATUS.pending}`}>
                {o.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(o.createdAt).toLocaleString()} ·{" "}
              <span className="text-gold">${Number(o.total).toFixed(2)}</span>
            </div>
            {open === o.id && (
              <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-muted-foreground">
                    <span>{it.quantity}× {it.productName}</span>
                    <span className="text-white">${Number(it.lineTotal).toFixed(2)}</span>
                  </div>
                ))}
                {o.pickupNote && <p className="pt-1 text-xs">📝 {o.pickupNote}</p>}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
