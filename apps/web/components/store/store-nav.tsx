"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Package, Search } from "lucide-react";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

export function StoreNav() {
  const { count } = useCart();
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        pathname === href ? "text-usared" : "text-slate-600 hover:text-slate-900"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40">
      <div className="usa-stripe h-1 w-full" />
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:flex sm:items-center sm:gap-4 sm:px-6 sm:py-5">
          <Link href="/" className="mx-auto flex w-fit shrink-0 items-center sm:hidden">
            <Image
              src="/brand/logo.png"
              alt="Big MO's Bangers"
              width={1290}
              height={689}
              priority
              sizes="160px"
              className="h-auto w-40 rounded-lg ring-1 ring-slate-200"
            />
          </Link>

          <Link href="/" className="hidden shrink-0 items-center sm:flex">
            <Image
              src="/brand/logo.png"
              alt="Big MO's Bangers"
              width={1290}
              height={689}
              priority
              className="h-16 w-auto rounded-lg ring-1 ring-slate-200"
            />
          </Link>

          {/* Search (desktop) */}
          <Link
            href="/shop"
            className="ml-2 hidden flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-slate-300 md:flex"
          >
            <Search className="h-4 w-4" />
            Search fireworks…
          </Link>

          <nav className="mt-3 flex items-center justify-center gap-1 sm:mt-0 sm:ml-auto">
            {link("/shop", "Shop")}
            <Link
              href="/orders"
              className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:flex"
            >
              <Package className="h-4 w-4" /> Orders
            </Link>
            <Link
              href="/cart"
              className="relative ml-1 flex items-center gap-2 rounded-lg bg-usared px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-usared-dark"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-usablue px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
