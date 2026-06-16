import Link from "next/link";
import { Plus, ImageOff } from "lucide-react";
import { listProducts } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "@/components/dashboard/product-row-actions";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts({ includeInactive: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-wider text-rwb">PRODUCTS</h1>
        <Button asChild variant="brand">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-white/5">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-white">
                  <Link href={`/dashboard/products/${p.id}`} className="hover:text-electric">
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.category?.emoji} {p.category?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.trackInventory ? p.inventoryQty : "∞"}
                </TableCell>
                <TableCell>
                  <ProductRowActions id={p.id} isFeatured={p.isFeatured} isActive={p.isActive} />
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No products yet.{" "}
                  <Link href="/dashboard/products/new" className="text-electric underline">
                    Add your first one
                  </Link>
                  .
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
