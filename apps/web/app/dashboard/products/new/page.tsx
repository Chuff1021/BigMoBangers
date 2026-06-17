import { listCategories } from "@/lib/store";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Catalog</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">New product</h1>
      </div>
      <div className="card-lite p-6">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        />
      </div>
    </div>
  );
}
