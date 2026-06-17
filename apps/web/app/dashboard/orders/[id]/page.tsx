import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusActions } from "@/components/dashboard/order-status-actions";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-usared"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{order.status}</Badge>
          <Badge variant="secondary" className="capitalize">{order.paymentStatus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-lite p-6 md:col-span-2">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-900">Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Line</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium text-slate-900">{it.productName}</TableCell>
                  <TableCell className="text-right">{it.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(it.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatMoney(it.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax</span>
              <span className="text-slate-900">{formatMoney(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-lite p-6">
            <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Customer</h2>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-slate-900">{order.customerName}</div>
              {order.customerPhone && <div className="text-slate-500">{order.customerPhone}</div>}
              {order.customerEmail && <div className="text-slate-500">{order.customerEmail}</div>}
              {order.pickupNote && (
                <div className="mt-3 rounded bg-slate-50 p-2 text-xs text-slate-500">
                  📝 {order.pickupNote}
                </div>
              )}
            </div>
          </div>

          <div className="card-lite p-6">
            <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Update Status</h2>
            <OrderStatusActions orderId={order.id} current={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
