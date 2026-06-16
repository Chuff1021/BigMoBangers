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
    <div className="grid-bg flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface/60 backdrop-blur-xl md:flex">
        <div className="border-b border-white/10 p-4">
          <Image
            src="/brand/logo.png"
            alt="Big MO's Bangers"
            width={1290}
            height={689}
            className="w-full rounded-lg ring-1 ring-white/10"
            priority
          />
        </div>
        <Sidebar />
        <div className="mt-auto p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-electric"
          >
            <Store className="h-4 w-4" /> View storefront
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-surface/40 px-6 backdrop-blur-xl">
          <div>
            <div className="font-display text-xl tracking-wider text-white">
              {tenant.businessName}
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Operator Command Center
            </div>
          </div>
          {IS_DEMO ? (
            <span className="glass glow-blue rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-electric">
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
