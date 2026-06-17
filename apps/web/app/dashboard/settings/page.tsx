import { getTenant } from "@/lib/store";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const tenant = await getTenant();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-usared">Config</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
      </div>
      <div className="card-lite max-w-xl p-6">
        <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Business details</h2>
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
