import { getCategories } from "@bangers/db";
import { getTenantFromRequest } from "@/lib/auth";
import { ProductForm } from "@/components/dashboard/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const tenant = await getTenantFromRequest();
  const categories = await getCategories(tenant.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Product</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
      />
    </div>
  );
}
