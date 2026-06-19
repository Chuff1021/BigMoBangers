import Link from "next/link";
import { ScanLine, Clapperboard, ArrowRight, PackagePlus } from "lucide-react";

export const metadata = { title: "Big MO's Bangers — Staff" };

export default function StaffHub() {
  return (
    <div className="px-5 py-8">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-usared">Staff</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Scanner</h1>
      <p className="mt-1 text-sm text-slate-500">
        Scan a barcode to ring up a customer or pull up a product video.
      </p>

      <div className="mt-6 space-y-4">
        <Link
          href="/staff/checkout"
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-usared">
            <ScanLine className="h-6 w-6" />
          </span>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Checkout a customer</h2>
            <ArrowRight className="h-5 w-5 text-slate-300" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Scan each item, show the total, then record the sale after payment on Clover.
          </p>
        </Link>

        <Link
          href="/staff/scan"
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-usablue">
            <Clapperboard className="h-6 w-6" />
          </span>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Product lookup &amp; video</h2>
            <ArrowRight className="h-5 w-5 text-slate-300" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Scan a firework to show the customer its demo video and details.
          </p>
        </Link>

        <Link
          href="/staff/add-product"
          className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PackagePlus className="h-6 w-6" />
          </span>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Add POS-only product</h2>
            <ArrowRight className="h-5 w-5 text-slate-300" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Scan a barcode, enter the name and price, and add it for in-tent checkout.
          </p>
        </Link>
      </div>

      <Link href="/" className="mt-8 block text-center text-sm font-semibold text-slate-500">
        ← Back to store
      </Link>
    </div>
  );
}
