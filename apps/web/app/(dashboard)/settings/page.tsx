import { getTenantFromRequest } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const tenant = await getTenantFromRequest();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Business name" value={tenant.businessName} />
          <Field label="Slug" value={tenant.slug} />
          <Field label="Phone" value={tenant.phone ?? "—"} />
          <Field
            label="Address"
            value={[tenant.address, tenant.city, tenant.state, tenant.zip]
              .filter(Boolean)
              .join(", ") || "—"}
          />
          <Field label="Timezone" value={tenant.timezone} />
          <Field label="Tax rate" value={`${(Number(tenant.taxRate) * 100).toFixed(2)}%`} />
          <Field label="Brand color" value={tenant.primaryColor} />
        </CardContent>
      </Card>
    </div>
  );
}
