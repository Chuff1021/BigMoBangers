import { notFound } from "next/navigation";
import { getProduct, listCategories } from "@/lib/store";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), listCategories()]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Catalog</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Edit product</h1>
      </div>
      <div className="card-lite p-6">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
          initial={{
            id: product.id,
            name: product.name,
            price: product.price,
            categoryId: product.categoryId,
            description: product.description,
            youtubeUrl: product.youtubeUrl,
            inventoryQty: product.inventoryQty,
            lowStockThreshold: product.lowStockThreshold,
            trackInventory: product.trackInventory,
            isFeatured: product.isFeatured,
            tags: product.tags,
            imageUrl: product.imageUrl,
          }}
        />
      </div>
    </div>
  );
}
