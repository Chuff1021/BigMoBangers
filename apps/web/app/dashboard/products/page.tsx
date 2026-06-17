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
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Catalog</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Products</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </div>

      <div className="card-lite overflow-hidden p-0">
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
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-slate-50">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain" />
                    ) : (
                      <ImageOff className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  <Link href={`/dashboard/products/${p.id}`} className="hover:text-usared">
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-500">
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
                <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                  No products yet.{" "}
                  <Link href="/dashboard/products/new" className="text-usablue underline">
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
