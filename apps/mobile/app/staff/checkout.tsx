import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { fetchProductByCode, posSale, type ApiProduct } from "@/lib/api";
import { money } from "@/lib/format";

interface Line {
  product: ApiProduct;
  qty: number;
}

const TAX_RATE = 0.0825;

export default function StaffCheckout() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [banner, setBanner] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNumber: string; total: string } | null>(null);

  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = lines.reduce((s, l) => s + l.qty, 0);

  function flash(text: string, ok: boolean) {
    setBanner({ text, ok });
    setTimeout(() => setBanner(null), 1600);
  }

  async function onScan(code: string) {
    const product = await fetchProductByCode(code);
    if (!product) {
      flash(`No match for ${code}`, false);
      return;
    }
    setLines((prev) => {
      const ex = prev.find((l) => l.product.id === product.id);
      if (ex) return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { product, qty: 1 }];
    });
    flash(`Added ${product.name}`, true);
  }

  function setQty(id: string, q: number) {
    setLines((prev) =>
      q <= 0 ? prev.filter((l) => l.product.id !== id) : prev.map((l) => (l.product.id === id ? { ...l, qty: q } : l))
    );
  }

  async function charge(method: "cash" | "card") {
    if (lines.length === 0) return;
    setBusy(true);
    try {
      const res = await posSale(
        lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
        { method }
      );
      setDone({ orderNumber: res.orderNumber, total: res.total });
      setLines([]);
    } catch {
      flash("Sale failed — try again", false);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Text className="text-6xl">✅</Text>
        <Text className="mt-4 text-2xl font-extrabold text-slate-900">Sale complete</Text>
        <Text className="mt-1 font-semibold text-[#c8102e]">{done.orderNumber}</Text>
        <Text className="mt-1 text-3xl font-extrabold text-slate-900">{money(done.total)}</Text>
        <View className="mt-8 flex-row gap-3">
          <Pressable onPress={() => setDone(null)} className="rounded-xl bg-[#c8102e] px-6 py-3">
            <Text className="font-bold text-white">New sale</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/staff")} className="rounded-xl border border-slate-300 bg-white px-6 py-3">
            <Text className="font-bold text-slate-700">Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Scanner (top) */}
      <View className="h-[42%]">
        <BarcodeScanner onScan={onScan} active={!busy} />
        {banner && (
          <View
            className={`absolute inset-x-4 top-4 rounded-xl px-4 py-3 ${
              banner.ok ? "bg-emerald-600" : "bg-[#c8102e]"
            }`}
          >
            <Text className="text-center font-bold text-white">{banner.text}</Text>
          </View>
        )}
      </View>

      {/* Ticket (bottom) */}
      <View className="flex-1 rounded-t-3xl bg-white px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-extrabold text-slate-900">Ticket</Text>
          <Text className="text-sm text-slate-500">{count} item{count === 1 ? "" : "s"}</Text>
        </View>

        <ScrollView className="mt-2 flex-1">
          {lines.length === 0 && (
            <Text className="py-10 text-center text-slate-400">
              Scan a barcode to add the first item.
            </Text>
          )}
          {lines.map((l) => (
            <View key={l.product.id} className="flex-row items-center gap-2 border-b border-slate-100 py-2">
              <View className="flex-1">
                <Text numberOfLines={1} className="font-semibold text-slate-900">{l.product.name}</Text>
                <Text className="text-xs text-slate-500">{money(l.product.price)}</Text>
              </View>
              <View className="flex-row items-center gap-1 rounded-lg border border-slate-200 p-0.5">
                <Pressable onPress={() => setQty(l.product.id, l.qty - 1)} className="h-7 w-7 items-center justify-center rounded">
                  <Text className="text-lg font-bold text-slate-700">−</Text>
                </Pressable>
                <Text className="min-w-6 text-center font-semibold">{l.qty}</Text>
                <Pressable onPress={() => setQty(l.product.id, l.qty + 1)} className="h-7 w-7 items-center justify-center rounded">
                  <Text className="text-lg font-bold text-slate-700">+</Text>
                </Pressable>
              </View>
              <Text className="w-16 text-right font-bold text-slate-900">
                {money(Number(l.product.price) * l.qty)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View className="border-t border-slate-200 py-3">
          <View className="flex-row justify-between"><Text className="text-slate-500">Subtotal</Text><Text className="text-slate-900">{money(subtotal)}</Text></View>
          <View className="flex-row justify-between"><Text className="text-slate-500">Tax (8.25%)</Text><Text className="text-slate-900">{money(tax)}</Text></View>
          <View className="mt-1 flex-row justify-between"><Text className="text-lg font-extrabold text-slate-900">Total</Text><Text className="text-lg font-extrabold text-slate-900">{money(total)}</Text></View>

          <View className="mt-3 flex-row gap-2 pb-4">
            <Pressable
              disabled={busy || lines.length === 0}
              onPress={() => charge("cash")}
              className="flex-1 items-center rounded-xl border border-slate-300 bg-white py-3.5 disabled:opacity-40"
            >
              <Text className="font-bold text-slate-700">{busy ? "…" : "Cash"}</Text>
            </Pressable>
            <Pressable
              disabled={busy || lines.length === 0}
              onPress={() => charge("card")}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#c8102e] py-3.5 disabled:opacity-40"
            >
              {busy && <ActivityIndicator color="#fff" />}
              <Text className="font-bold text-white">Charge {money(total)}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
