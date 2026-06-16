import { CartProvider } from "@/components/store/cart-context";
import { StoreNav } from "@/components/store/store-nav";

const MARQUEE = "★ BIG BANGS ★ LOW PRICES ★ GREAT TIME ★ ";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="grid-bg flex min-h-screen flex-col">
        <StoreNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

        <footer className="mt-10 border-t border-white/10 bg-surface/40">
          <div className="overflow-hidden whitespace-nowrap py-3 text-sm font-bold uppercase tracking-[0.3em] text-gold">
            <div className="marquee-track inline-block">
              {MARQUEE.repeat(8)}
              {MARQUEE.repeat(8)}
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
            <p>Big MO&apos;s Bangers · 123 Main St, Republic, MO 65738 · 417-555-0100</p>
            <p className="mt-1">
              Secure checkout powered by <span className="font-semibold text-white">Clover</span>.
              Must be 18+ to purchase. Use fireworks responsibly. 🇺🇸
            </p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
