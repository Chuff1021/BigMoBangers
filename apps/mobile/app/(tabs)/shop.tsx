import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPill } from "@/components/CategoryPill";

export default function ShopScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(
    params.categoryId
  );

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({
    categoryId,
    search: search.trim() || undefined,
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-4 pt-2">
        <Text className="text-2xl font-extrabold text-slate-900">Shop</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search fireworks…"
          placeholderTextColor="#94a3b8"
          className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-3"
        style={{ maxHeight: 56 }}
      >
        <CategoryPill
          label="All"
          selected={!categoryId}
          onPress={() => setCategoryId(undefined)}
        />
        {categories?.map((c) => (
          <CategoryPill
            key={c.id}
            label={c.name}
            emoji={c.emoji}
            selected={categoryId === c.id}
            onPress={() => setCategoryId(c.id)}
          />
        ))}
      </ScrollView>

      {isLoading && <ActivityIndicator className="mt-8" color="#FF4500" />}

      {!isLoading && products && products.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl">🔍</Text>
          <Text className="mt-3 text-center text-slate-500">
            No fireworks match your search. Try another category.
          </Text>
        </View>
      )}

      <ScrollView contentContainerClassName="pb-8">
        <View className="flex-row flex-wrap px-3 pt-1">
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
