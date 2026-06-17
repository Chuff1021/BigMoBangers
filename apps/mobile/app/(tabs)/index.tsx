import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategories, useFeaturedProducts, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPill } from "@/components/CategoryPill";
import { useCart } from "@/lib/cart";

export default function HomeScreen() {
  const router = useRouter();
  const count = useCart((s) => s.itemCount());
  const { data: categories } = useCategories();
  const { data: featured } = useFeaturedProducts();
  const { data: products, isLoading } = useProducts();

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        {/* ===================== HERO ===================== */}
        <ImageBackground
          source={require("../../assets/brand/hero-fireworks.jpg")}
          resizeMode="cover"
        >
          {/* dark overlay for contrast */}
          <View className="absolute inset-0 bg-[rgba(6,9,26,0.58)]" />
          {/* red/white/blue top stripe */}
          <View className="h-1.5 w-full flex-row">
            <View className="h-full flex-1 bg-[#c8102e]" />
            <View className="h-full flex-1 bg-white" />
            <View className="h-full flex-1 bg-[#0a3161]" />
          </View>

          <SafeAreaView edges={["top"]}>
            {/* floating cart */}
            <View className="flex-row justify-end px-4 pt-1">
              <Pressable
                onPress={() => router.push("/cart")}
                className="h-11 w-11 items-center justify-center rounded-full bg-white/15 border border-white/25"
              >
                <Text className="text-xl">🛒</Text>
                {count > 0 && (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#c8102e]">
                    <Text className="text-[10px] font-bold text-white">{count}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View className="items-center px-5 pb-9 pt-1">
              {/* 250th badge */}
              <View className="rounded-full bg-[#ffd23f] px-4 py-1.5">
                <Text className="text-[11px] font-extrabold uppercase tracking-wide text-[#3a2a02]">
                  ★ 1776–2026 · America&apos;s 250th ★
                </Text>
              </View>

              {/* big logo */}
              <View className="mt-5 w-full px-1">
                <Image
                  source={require("../../assets/brand/logo.png")}
                  resizeMode="contain"
                  className="w-full"
                  style={{ aspectRatio: 1290 / 689 }}
                />
              </View>

              {/* headline */}
              <Text className="mt-6 text-center text-3xl font-extrabold leading-9 text-white">
                Make America&apos;s 250th the{" "}
                <Text className="text-[#ffd23f]">biggest 4th yet.</Text>
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-200">
                Reserve premium fireworks online and pick up at the tent in Republic, MO.
              </Text>

              {/* CTA */}
              <Pressable
                onPress={() => router.push("/shop")}
                className="mt-6 flex-row items-center gap-2 rounded-xl bg-[#c8102e] px-7 py-3.5"
              >
                <Text className="text-base font-bold text-white">Shop Fireworks</Text>
                <Text className="text-base font-bold text-white">→</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* ===================== CATEGORIES ===================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 py-4"
        >
          {categories?.map((c) => (
            <CategoryPill
              key={c.id}
              label={c.name}
              emoji={c.emoji}
              onPress={() => router.push(`/shop?categoryId=${c.id}`)}
            />
          ))}
        </ScrollView>

        {/* ===================== FEATURED ===================== */}
        {featured && featured.length > 0 && (
          <View>
            <Text className="px-4 text-lg font-bold text-slate-900">🔥 Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 py-3"
            >
              {featured.map((p) => (
                <View key={p.id} className="mr-3 w-40">
                  <ProductCard product={p} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ===================== ALL PRODUCTS ===================== */}
        <Text className="px-4 pt-2 text-lg font-bold text-slate-900">All Products</Text>
        {isLoading && <ActivityIndicator className="mt-6" color="#c8102e" />}
        <View className="flex-row flex-wrap px-3 pt-3">
          {products?.map((p) => (
            <View key={p.id} className="w-1/2 px-1">
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
