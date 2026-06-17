import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import type { ApiProduct } from "@/lib/api";

export function ProductCard({ product }: { product: ApiProduct }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const photoCount = [product.imageUrl, ...(product.images ?? [])].filter(Boolean).length;
  const hasVideo = Boolean(product.youtubeUrl || product.streamVideoId);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      className="mb-3 flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
    >
      <View className="aspect-square w-full items-center justify-center bg-slate-100">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-4xl">🎆</Text>
        )}
        {(photoCount > 0 || hasVideo) && (
          <View className="absolute bottom-2 left-2 flex-row gap-1">
            {photoCount > 0 && (
              <View className="rounded-full bg-black/70 px-2 py-1">
                <Text className="text-[10px] font-bold uppercase text-white">
                  {photoCount} Photos
                </Text>
              </View>
            )}
            {hasVideo && (
              <View className="rounded-full bg-black/70 px-2 py-1">
                <Text className="text-[10px] font-bold uppercase text-white">Video</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View className="p-3">
        <Text numberOfLines={1} className="text-sm font-semibold text-slate-900">
          {product.name}
        </Text>
        <Text className="mt-1 text-base font-bold text-brand">
          {money(product.price)}
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            addItem({
              productId: product.id,
              name: product.name,
              price: Number(product.price),
              quantity: 1,
              imageUrl: product.imageUrl ?? undefined,
            });
          }}
          className="mt-2 items-center rounded-lg bg-brand py-2"
        >
          <Text className="text-xs font-bold text-white">Add to Cart</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
