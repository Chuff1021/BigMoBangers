import { listProducts } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryControls } from "@/components/dashboard/inventory-controls";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const products = await listProducts({ includeInactive: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-wider text-rwb">INVENTORY</h1>

      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-xl tracking-wide text-white">
          {products.length} products on the shelf
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const low = p.trackInventory && p.inventoryQty <= p.lowStockThreshold;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-white">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category?.emoji} {p.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                  <TableCell className="text-right font-display text-lg tabular-nums tracking-wide">
                    {p.trackInventory ? p.inventoryQty : "∞"}
                  </TableCell>
                  <TableCell>
                    {!p.trackInventory ? (
                      <Badge variant="secondary">Untracked</Badge>
                    ) : low ? (
                      <Badge variant="destructive">Low stock</Badge>
                    ) : (
                      <Badge variant="success">In stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <InventoryControls productId={p.id} qty={p.inventoryQty} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
