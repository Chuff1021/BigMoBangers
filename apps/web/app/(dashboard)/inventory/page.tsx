import { getProducts } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const tenant = await getTenantFromRequest();
  const products = await getProducts(tenant.id, { includeInactive: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <Card>
        <CardHeader>
          <CardTitle>{products.length} products</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.category?.emoji} {p.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                    <TableCell className="text-right tabular-nums">
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
        </CardContent>
      </Card>
    </div>
  );
}
