import Link from "next/link";
import { ClipboardList, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { getOrders, getProducts } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, timeSince } from "@/lib/utils";

export const dynamic = "force-dynamic";

function isToday(d: Date | string) {
  const date = new Date(d);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default async function DashboardHome() {
  const tenant = await getTenantFromRequest();
  const [orders, products] = await Promise.all([
    getOrders(tenant.id),
    getProducts(tenant.id, { includeInactive: true }),
  ]);

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const revenueToday = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;
  const lowStock = products.filter(
    (p) => p.trackInventory && p.inventoryQty <= p.lowStockThreshold
  );

  const stats = [
    { label: "Orders Today", value: todayOrders.length, icon: ClipboardList },
    { label: "Revenue Today", value: formatMoney(revenueToday), icon: DollarSign },
    { label: "Pending Orders", value: pending, icon: Clock },
    { label: "Low Stock Items", value: lowStock.length, icon: AlertTriangle },
  ];

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Today at {tenant.businessName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent"
            >
              <div>
                <div className="font-medium">{o.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.orderNumber} · {o.items.length} item
                  {o.items.length === 1 ? "" : "s"} · {timeSince(o.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatMoney(o.total)}</span>
                <Badge variant="outline" className="capitalize">
                  {o.status}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
