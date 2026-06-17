import Link from "next/link";
import { CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { listOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/utils";

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

export default async function PaymentsPage() {
  const orders = await listOrders();
  const paid = orders.filter((o) => o.paymentStatus === "paid");

  const revenueAll = paid.reduce((s, o) => s + Number(o.total), 0);
  const paidToday = paid.filter((o) => isToday(o.createdAt));
  const revenueToday = paidToday.reduce((s, o) => s + Number(o.total), 0);
  const avg = paid.length ? revenueAll / paid.length : 0;
  const unpaid = orders.filter((o) => o.paymentStatus !== "paid").length;

  const stats = [
    { label: "Revenue Today", value: formatMoney(revenueToday), icon: DollarSign, bg: "bg-emerald-50", tint: "text-emerald-600" },
    { label: "Payments Today", value: paidToday.length, icon: CreditCard, bg: "bg-blue-50", tint: "text-usablue" },
    { label: "Avg. Ticket", value: formatMoney(avg), icon: TrendingUp, bg: "bg-amber-50", tint: "text-amber-600" },
    { label: "Unpaid Orders", value: unpaid, icon: Receipt, bg: "bg-red-50", tint: "text-usared" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Money</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">Every transaction, taken online or at the register.</p>
        </div>
        <Link
          href="/dashboard/register"
          className="inline-flex items-center gap-2 rounded-xl bg-usared px-5 py-2.5 text-sm font-semibold text-white hover:bg-usared-dark"
        >
          <CreditCard className="h-4 w-4" /> New sale
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-lite p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{s.label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.tint}`}>
                <s.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card-lite overflow-hidden p-0">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Recent transactions</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/dashboard/orders/${o.id}`} className="font-medium text-slate-900 hover:text-usared">
                    {o.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-600">{o.customerName}</TableCell>
                <TableCell className="text-slate-500">Clover</TableCell>
                <TableCell>
                  {o.paymentStatus === "paid" ? (
                    <Badge variant="success">Paid</Badge>
                  ) : (
                    <Badge variant="secondary" className="capitalize">{o.paymentStatus}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">{formatMoney(o.total)}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
