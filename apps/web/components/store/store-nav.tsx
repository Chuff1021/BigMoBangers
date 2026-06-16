"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "./cart-context";

export function StoreNav() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt="Big MO's Bangers"
            width={1290}
            height={689}
            priority
            className="h-10 w-auto rounded-md ring-1 ring-white/10 sm:h-12"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/shop"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-white sm:block"
          >
            Shop
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-white"
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">My Orders</span>
          </Link>
          <Link
            href="/cart"
            className="glass glow-red relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
          >
            <ShoppingCart className="h-4 w-4 text-brand" />
            Cart
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
