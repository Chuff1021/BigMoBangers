import { listProducts, listCategories } from "@/lib/store";
import { ShopBrowser } from "@/components/store/shop-browser";
import type { StoreProduct } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;
  const [products, categories] = await Promise.all([
    listProducts({ categoryId }),
    listCategories(),
  ]);

  const initial: StoreProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    inventoryQty: p.inventoryQty,
    trackInventory: p.trackInventory,
    lowStockThreshold: p.lowStockThreshold,
    category: p.category ? { name: p.category.name, emoji: p.category.emoji } : null,
  }));

  return (
    <ShopBrowser
      initialProducts={initial}
      categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
      initialCategoryId={categoryId}
    />
  );
}
