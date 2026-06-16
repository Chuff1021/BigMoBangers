import { Image, Pressable, Text, View } from "react-native";
import { useCart, type CartItem as CartItemType } from "@/lib/cart";
import { money } from "@/lib/format";

export function CartItem({ item }: { item: CartItemType }) {
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-slate-100 bg-white p-3">
      <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <Text className="text-2xl">🎆</Text>
        )}
      </View>

      <View className="ml-3 flex-1">
        <Text numberOfLines={1} className="font-semibold text-slate-900">
          {item.name}
        </Text>
        <Text className="text-sm text-slate-500">{money(item.price)} each</Text>

        <View className="mt-2 flex-row items-center">
          <Pressable
            onPress={() => updateQty(item.productId, item.quantity - 1)}
            className="h-7 w-7 items-center justify-center rounded-full bg-slate-200"
          >
            <Text className="text-base font-bold text-slate-700">−</Text>
          </Pressable>
          <Text className="mx-3 min-w-6 text-center font-semibold">{item.quantity}</Text>
          <Pressable
            onPress={() => updateQty(item.productId, item.quantity + 1)}
            className="h-7 w-7 items-center justify-center rounded-full bg-slate-200"
          >
            <Text className="text-base font-bold text-slate-700">+</Text>
          </Pressable>
        </View>
      </View>

      <View className="items-end">
        <Text className="font-bold text-slate-900">
          {money(item.price * item.quantity)}
        </Text>
        <Pressable onPress={() => removeItem(item.productId)} className="mt-2">
          <Text className="text-xs text-red-500">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}
