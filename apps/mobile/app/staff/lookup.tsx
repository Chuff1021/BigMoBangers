import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { VideoPlayer } from "@/components/VideoPlayer";
import { fetchProductByCode, type ApiProduct } from "@/lib/api";
import { money } from "@/lib/format";

export default function StaffLookup() {
  const router = useRouter();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);

  async function onScan(code: string) {
    setLoading(true);
    setNotFound(null);
    const p = await fetchProductByCode(code);
    setLoading(false);
    if (p) setProduct(p);
    else setNotFound(code);
  }

  // Result view
  if (product) {
    const hasVideo = Boolean(product.youtubeUrl || product.streamVideoId);
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="pb-10">
        <View className="aspect-square w-full items-center justify-center bg-white p-6">
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} className="h-full w-full" resizeMode="contain" />
          ) : (
            <Text className="text-7xl">🎆</Text>
          )}
        </View>
        <View className="px-5 pt-4">
          {product.category && (
            <Text className="text-xs font-bold uppercase tracking-wide text-[#0a3161]">
              {product.category.emoji} {product.category.name}
            </Text>
          )}
          <Text className="mt-1 text-2xl font-extrabold text-slate-900">{product.name}</Text>
          <Text className="mt-1 text-2xl font-extrabold text-slate-900">{money(product.price)}</Text>
          {(product.barcode || product.sku) && (
            <View className="mt-3 self-start rounded-lg bg-slate-100 px-3 py-2">
              <Text className="text-xs font-semibold text-slate-600">
                Scan code: {product.barcode || product.sku}
              </Text>
            </View>
          )}

          {hasVideo ? (
            <View className="mt-4">
              <Text className="mb-2 text-sm font-bold text-slate-700">Demo video</Text>
              <VideoPlayer streamVideoId={product.streamVideoId} youtubeUrl={product.youtubeUrl} />
            </View>
          ) : (
            <View className="mt-4 rounded-xl bg-slate-100 p-4">
              <Text className="text-center text-sm text-slate-500">No video available for this product.</Text>
            </View>
          )}

          {product.description ? (
            <Text className="mt-4 leading-6 text-slate-600">{product.description}</Text>
          ) : null}

          <Pressable
            onPress={() => setProduct(null)}
            className="mt-6 items-center rounded-xl bg-[#c8102e] py-3.5"
          >
            <Text className="text-base font-bold text-white">Scan another</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/staff")} className="mt-3 items-center py-2">
            <Text className="text-sm font-semibold text-slate-500">← Staff menu</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Scanner view
  return (
    <View className="flex-1 bg-black">
      <BarcodeScanner onScan={onScan} active={!loading} />
      {loading && (
        <View className="absolute inset-x-0 bottom-12 items-center">
          <View className="flex-row items-center gap-2 rounded-full bg-white/15 px-4 py-2">
            <ActivityIndicator color="#fff" />
            <Text className="font-semibold text-white">Looking up…</Text>
          </View>
        </View>
      )}
      {notFound && (
        <View className="absolute inset-x-4 bottom-12 rounded-xl bg-[#c8102e] px-4 py-3">
          <Text className="text-center font-bold text-white">No product for {notFound}</Text>
        </View>
      )}
      <Pressable onPress={() => router.replace("/staff")} className="absolute left-4 top-12">
        <Text className="text-base font-semibold text-white">← Staff</Text>
      </Pressable>
    </View>
  );
}
