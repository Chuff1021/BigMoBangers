import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCart, TAX_RATE } from "@/lib/cart";
import { createCloverCheckout } from "@/lib/api";
import { money } from "@/lib/format";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    phone?: string;
    email?: string;
    note?: string;
  }>();

  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());
  const clearCart = useCart((s) => s.clearCart);

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [status, setStatus] = useState<"review" | "processing" | "done">("review");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    setStatus("processing");
    try {
      const res = await createCloverCheckout({
        customerName: params.name,
        customerPhone: params.phone || undefined,
        customerEmail: params.email || undefined,
        pickupNote: params.note || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      // Live Clover: open the hosted pay page in the browser.
      if (res.href) {
        await Linking.openURL(res.href);
      }

      // Demo (or after returning from Clover): mark complete.
      setOrderNumber(res.orderNumber);
      clearCart();
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStatus("review");
    }
  }

  if (status === "done") {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Text className="text-6xl">🎉</Text>
        <Text className="mt-4 text-2xl font-extrabold text-slate-900">Order placed!</Text>
        {orderNumber && (
          <Text className="mt-1 text-base font-semibold text-brand">{orderNumber}</Text>
        )}
        <Text className="mt-3 text-center text-slate-600">
          We&apos;ll have your order ready! Show your order number at the tent for pickup.
          You&apos;ll get a text when it&apos;s ready.
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          className="mt-8 rounded-xl bg-brand px-6 py-3"
        >
          <Text className="font-bold text-white">Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-4">
      <Text className="mb-4 text-xl font-extrabold text-slate-900">Review &amp; Pay</Text>

      <View className="mb-4 rounded-xl bg-white p-4">
        {items.map((i) => (
          <View key={i.productId} className="flex-row justify-between py-1">
            <Text className="text-slate-700">{i.quantity}× {i.name}</Text>
            <Text className="text-slate-700">{money(i.price * i.quantity)}</Text>
          </View>
        ))}
        <View className="my-2 h-px bg-slate-100" />
        <Row label="Subtotal" value={money(subtotal)} />
        <Row label="Tax (8.25%)" value={money(tax)} />
        <Row label="Total" value={money(total)} bold />
      </View>

      <View className="mb-4 rounded-xl bg-white p-4">
        <Text className="font-semibold text-slate-900">{params.name}</Text>
        {params.phone ? <Text className="text-slate-500">{params.phone}</Text> : null}
        {params.email ? <Text className="text-slate-500">{params.email}</Text> : null}
        {params.note ? <Text className="mt-1 text-xs text-slate-500">📝 {params.note}</Text> : null}
      </View>

      {error ? <Text className="mb-3 text-sm text-red-500">{error}</Text> : null}

      <Pressable
        disabled={status === "processing"}
        onPress={pay}
        className="flex-row items-center justify-center rounded-xl bg-brand py-4"
      >
        {status === "processing" && <ActivityIndicator color="white" className="mr-2" />}
        <Text className="text-base font-bold text-white">
          {status === "processing" ? "Processing…" : `Pay ${money(total)} with Clover`}
        </Text>
      </Pressable>
      <Text className="mt-2 text-center text-xs text-slate-400">
        Secure checkout powered by Clover
      </Text>
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className={bold ? "font-bold" : "text-slate-500"}>{label}</Text>
      <Text className={bold ? "font-bold" : "text-slate-700"}>{value}</Text>
    </View>
  );
}
