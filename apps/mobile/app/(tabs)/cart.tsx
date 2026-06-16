import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart, TAX_RATE } from "@/lib/cart";
import { CartItem } from "@/components/CartItem";
import { money } from "@/lib/format";

export default function CartScreen() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Text className="text-5xl">🛒</Text>
        <Text className="mt-4 text-lg font-semibold text-slate-900">
          Your cart is empty
        </Text>
        <Text className="mt-1 text-center text-slate-500">
          Add some bangers and light up the night.
        </Text>
        <Pressable
          onPress={() => router.push("/shop")}
          className="mt-6 rounded-xl bg-brand px-6 py-3"
        >
          <Text className="font-bold text-white">Start Shopping</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <Text className="px-4 pt-2 text-2xl font-extrabold text-slate-900">Cart</Text>

      <ScrollView contentContainerClassName="px-4 pt-3 pb-4">
        {items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </ScrollView>

      <View className="border-t border-slate-200 bg-white px-4 pb-6 pt-4">
        <Row label="Subtotal" value={money(subtotal)} />
        <Row label="Estimated tax (8.25%)" value={money(tax)} />
        <View className="my-2 h-px bg-slate-200" />
        <Row label="Total" value={money(total)} bold />
        <Pressable
          onPress={() => router.push("/checkout")}
          className="mt-4 items-center rounded-xl bg-brand py-4"
        >
          <Text className="text-base font-bold text-white">Proceed to Checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className={bold ? "text-base font-bold" : "text-slate-500"}>{label}</Text>
      <Text className={bold ? "text-base font-bold" : "text-slate-700"}>{value}</Text>
    </View>
  );
}
