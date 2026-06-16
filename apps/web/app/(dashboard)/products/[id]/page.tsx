import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenantFromRequest();
  const [product, categories] = await Promise.all([
    getProductById(tenant.id, id),
    getCategories(tenant.id),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
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
  );
}
