import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between gap-3 px-4 pt-2">
          <Image
            source={require("../../assets/brand/logo.png")}
            className="h-14 flex-1 rounded-lg"
            resizeMode="contain"
          />
          <Pressable
            onPress={() => router.push("/cart")}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Text className="text-xl">🛒</Text>
            {count > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-brand">
                <Text className="text-[10px] font-bold text-white">{count}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <Text className="px-4 pt-1 text-sm text-slate-500">
          Republic, MO · Light up the sky 🎆
        </Text>

        {/* Categories */}
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

        {/* Featured */}
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

        {/* All products */}
        <Text className="px-4 pt-2 text-lg font-bold text-slate-900">All Products</Text>
        {isLoading && <ActivityIndicator className="mt-6" color="#FF4500" />}
        <View className="flex-row flex-wrap px-3 pt-3">
          {products?.map((p) => (
            <View key={p.id} className="w-1/2 px-1">
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
