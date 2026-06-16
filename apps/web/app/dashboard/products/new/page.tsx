import { listCategories } from "@/lib/store";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-wider text-rwb">NEW PRODUCT</h1>
      <div className="glass rounded-2xl p-6">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        />
      </div>
    </div>
  );
}
