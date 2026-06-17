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
  pending: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-50 text-usablue",
  ready: "bg-emerald-50 text-emerald-700",
  completed: "bg-slate-100 text-slate-500",
  cancelled: "bg-red-50 text-usared",
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Track your order</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your phone number to check pickup status. (Demo: try{" "}
          <button onClick={() => setPhone("417-555-2210")} className="font-semibold text-usablue underline">
            417-555-2210
          </button>
          )
        </p>
      </div>

      <div className="card-lite flex items-center gap-2 p-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="Your phone number"
          className="w-full bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          onClick={lookup}
          className="flex items-center gap-2 rounded-lg bg-usared px-5 py-2 text-sm font-semibold text-white hover:bg-usared-dark"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Find
        </button>
      </div>

      {orders && orders.length === 0 && (
        <p className="text-center text-slate-500">No orders found for that number.</p>
      )}

      <div className="space-y-3">
        {orders?.map((o) => (
          <button
            key={o.id}
            onClick={() => setOpen(open === o.id ? null : o.id)}
            className="card-lite block w-full p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">{o.orderNumber}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS[o.status] ?? STATUS.pending}`}>
                {o.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {new Date(o.createdAt).toLocaleString()} ·{" "}
              <span className="font-semibold text-slate-900">${Number(o.total).toFixed(2)}</span>
            </div>
            {open === o.id && (
              <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-500">
                    <span>{it.quantity}× {it.productName}</span>
                    <span className="text-slate-900">${Number(it.lineTotal).toFixed(2)}</span>
                  </div>
                ))}
                {o.pickupNote && <p className="pt-1 text-xs text-slate-500">📝 {o.pickupNote}</p>}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
