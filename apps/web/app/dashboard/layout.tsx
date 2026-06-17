import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Store } from "lucide-react";
import { getTenant } from "@/lib/store";
import { IS_DEMO } from "@/lib/mode";
import { Sidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  return (
    <div className="store-scope flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="usa-stripe h-1 w-full" />
        <div className="border-b border-slate-200 p-4">
          <Image
            src="/brand/logo.png"
            alt="Big MO's Bangers"
            width={1290}
            height={689}
            className="w-full rounded-lg ring-1 ring-slate-200"
            priority
          />
        </div>
        <Sidebar />
        <div className="mt-auto p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:text-usared"
          >
            <Store className="h-4 w-4" /> View storefront
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              {tenant.businessName}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Operator Command Center
            </div>
          </div>
          {IS_DEMO ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-usablue">
              ★ Live Demo
            </span>
          ) : (
            <UserButton afterSignOutUrl="/dashboard" />
          )}
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
