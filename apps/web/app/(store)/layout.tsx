import { CartProvider } from "@/components/store/cart-context";
import { StoreNav } from "@/components/store/store-nav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="store-scope flex min-h-screen flex-col">
        <StoreNav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>

        <footer className="mt-12 border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="text-lg font-bold tracking-tight text-slate-900">
                Big MO&apos;s Bangers
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Republic, Missouri&apos;s home for premium fireworks. Order online,
                pick up at the tent, light up the sky.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="mb-2 font-semibold text-slate-900">Shop</div>
                <ul className="space-y-1.5 text-slate-500">
                  <li><a className="hover:text-usared" href="/shop">All Fireworks</a></li>
                  <li><a className="hover:text-usared" href="/orders">Track Order</a></li>
                  <li><a className="hover:text-usared" href="/cart">Cart</a></li>
                </ul>
              </div>
              <div>
                <div className="mb-2 font-semibold text-slate-900">Visit</div>
                <ul className="space-y-1.5 text-slate-500">
                  <li>123 Main St</li>
                  <li>Republic, MO 65738</li>
                  <li>417-555-0100</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="usa-stripe h-1 w-full" />
          <div className="bg-white py-4 text-center text-xs text-slate-400">
            Secure checkout by Clover · Must be 18+ to purchase · Use fireworks
            responsibly 🇺🇸
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
