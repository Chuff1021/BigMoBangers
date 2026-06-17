import Link from "next/link";
import { ClipboardList, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { listOrders, listProducts, getTenant } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { formatMoney, timeSince } from "@/lib/utils";

export const dynamic = "force-dynamic";

function isToday(d: string) {
  const date = new Date(d);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default async function DashboardHome() {
  const [tenant, orders, products] = await Promise.all([
    getTenant(),
    listOrders(),
    listProducts({ includeInactive: true }),
  ]);

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const revenueToday = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;
  const lowStock = products.filter(
    (p) => p.trackInventory && p.inventoryQty <= p.lowStockThreshold
  );

  const stats = [
    { label: "Orders Today", value: todayOrders.length, icon: ClipboardList, tint: "text-usablue", bg: "bg-blue-50" },
    { label: "Revenue (Paid)", value: formatMoney(revenueToday), icon: DollarSign, tint: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "In The Queue", value: pending, icon: Clock, tint: "text-usared", bg: "bg-red-50" },
    { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, tint: "text-amber-600", bg: "bg-amber-50" },
  ];

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Overview</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Command Center</h1>
        <p className="text-sm text-slate-500">Real-time pulse of {tenant.businessName}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-lite p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {s.label}
              </span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.tint}`}>
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card-lite p-6">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Recent orders</h2>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <div>
                <div className="font-semibold text-slate-900">{o.customerName}</div>
                <div className="text-xs text-slate-500">
                  {o.orderNumber} · {o.items.length} item
                  {o.items.length === 1 ? "" : "s"} · {timeSince(o.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{formatMoney(o.total)}</span>
                <Badge variant="outline" className="capitalize">{o.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
