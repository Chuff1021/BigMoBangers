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
    { label: "Orders Today", value: todayOrders.length, icon: ClipboardList, glow: "glow-blue", tint: "text-electric" },
    { label: "Revenue (Paid)", value: formatMoney(revenueToday), icon: DollarSign, glow: "glow-gold", tint: "text-gold" },
    { label: "In The Queue", value: pending, icon: Clock, glow: "glow-red", tint: "text-brand" },
    { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, glow: "glow-red", tint: "text-brand" },
  ];

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-wider text-rwb">COMMAND CENTER</h1>
        <p className="text-sm text-muted-foreground">
          Real-time pulse of {tenant.businessName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`glass ${s.glow} rounded-2xl p-5`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </span>
              <s.icon className={`h-5 w-5 ${s.tint}`} />
            </div>
            <div className={`mt-3 font-display text-4xl tracking-wide ${s.tint}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-2xl tracking-wide text-white">
          Recent Orders
        </h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-electric/40 hover:bg-white/10"
            >
              <div>
                <div className="font-semibold text-white">{o.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.orderNumber} · {o.items.length} item
                  {o.items.length === 1 ? "" : "s"} · {timeSince(o.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg tracking-wide text-gold">
                  {formatMoney(o.total)}
                </span>
                <Badge variant="outline" className="capitalize">{o.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
