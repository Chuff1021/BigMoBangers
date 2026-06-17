import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { fetchProductById } from "@/lib/api";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";

function stockLabel(qty: number, threshold: number, track: boolean) {
  if (!track) return { text: "In Stock", color: "text-green-600" };
  if (qty <= 0) return { text: "Out of Stock", color: "text-red-500" };
  if (qty <= threshold) return { text: "Low Stock", color: "text-amber-600" };
  return { text: "In Stock", color: "text-green-600" };
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#FF4500" />
      </View>
    );
  }

  const stock = stockLabel(
    product.inventoryQty,
    product.lowStockThreshold,
    product.trackInventory
  );
  const outOfStock = product.trackInventory && product.inventoryQty <= 0;
  const gallery = [product.imageUrl, ...(product.images ?? [])].filter(
    (src, idx, arr): src is string => Boolean(src) && arr.indexOf(src) === idx
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-28">
        <View className="aspect-square w-full items-center justify-center bg-slate-100">
          {gallery[0] ? (
            <Image
              source={{ uri: gallery[0] }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-7xl">🎆</Text>
          )}
        </View>

        <View className="px-4">
          {gallery.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 py-3"
            >
              {gallery.slice(1, 7).map((src) => (
                <View
                  key={src}
                  className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100"
                >
                  <Image source={{ uri: src }} className="h-full w-full" resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          )}

          <VideoPlayer
            streamVideoId={product.streamVideoId}
            youtubeUrl={product.youtubeUrl}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="flex-1 text-2xl font-extrabold text-slate-900">
              {product.name}
            </Text>
            <Text className="text-2xl font-extrabold text-brand">
              {money(product.price)}
            </Text>
          </View>

          {product.category && (
            <View className="mt-2 self-start rounded-full bg-slate-100 px-3 py-1">
              <Text className="text-xs font-semibold text-slate-600">
                {product.category.emoji} {product.category.name}
              </Text>
            </View>
          )}

          <Text className={`mt-2 text-sm font-semibold ${stock.color}`}>
            {stock.text}
          </Text>

          {product.description && (
            <Text className="mt-4 text-base leading-6 text-slate-600">
              {product.description}
            </Text>
          )}

          {/* Qty selector */}
          <View className="mt-6 flex-row items-center">
            <Text className="mr-4 font-semibold text-slate-700">Quantity</Text>
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-200"
            >
              <Text className="text-lg font-bold text-slate-700">−</Text>
            </Pressable>
            <Text className="mx-4 text-lg font-semibold">{qty}</Text>
            <Pressable
              onPress={() => setQty((q) => q + 1)}
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-200"
            >
              <Text className="text-lg font-bold text-slate-700">+</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sticky add-to-cart */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 pb-8 pt-3">
        <Pressable
          disabled={outOfStock}
          onPress={() => {
            addItem({
              productId: product.id,
              name: product.name,
              price: Number(product.price),
              quantity: qty,
              imageUrl: product.imageUrl ?? undefined,
            });
            router.push("/cart");
          }}
          className={`items-center rounded-xl py-4 ${
            outOfStock ? "bg-slate-300" : "bg-brand"
          }`}
        >
          <Text className="text-base font-bold text-white">
            {outOfStock ? "Out of Stock" : `Add ${qty} to Cart`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
