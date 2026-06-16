import { getTenant } from "@/lib/store";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const tenant = await getTenant();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl tracking-wider text-rwb">SETTINGS</h1>
      <div className="glass max-w-xl rounded-2xl p-6">
        <h2 className="mb-3 font-display text-xl tracking-wide text-white">Business details</h2>
        <Field label="Business name" value={tenant.businessName} />
        <Field label="Slug" value={tenant.slug} />
        <Field label="Phone" value={tenant.phone ?? "—"} />
        <Field
          label="Address"
          value={[tenant.address, tenant.city, tenant.state, tenant.zip].filter(Boolean).join(", ") || "—"}
        />
        <Field label="Timezone" value={tenant.timezone} />
        <Field label="Tax rate" value={`${(Number(tenant.taxRate) * 100).toFixed(2)}%`} />
        <Field label="Payments" value="Clover" />
        <Field label="Brand color" value={tenant.primaryColor} />
      </div>
    </div>
  );
}
