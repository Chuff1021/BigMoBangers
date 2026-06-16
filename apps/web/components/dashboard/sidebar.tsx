"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Sparkles,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/products", label: "Products", icon: Sparkles },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold tracking-wide transition-all",
              active
                ? "glass glow-red text-white"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                active ? "text-brand" : "text-muted-foreground group-hover:text-electric"
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
