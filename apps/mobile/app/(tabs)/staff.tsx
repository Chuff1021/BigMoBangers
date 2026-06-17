import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StaffHub() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-5 pt-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-[#c8102e]">
          Staff
        </Text>
        <Text className="mt-1 text-3xl font-extrabold text-slate-900">Scanner</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Scan a barcode to ring up a customer or pull up a product video.
        </Text>
      </View>

      <View className="gap-4 px-5 pt-6">
        <Pressable
          onPress={() => router.push("/staff/checkout")}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <Text className="text-4xl">🧾</Text>
          <Text className="mt-3 text-xl font-extrabold text-slate-900">
            Checkout a customer
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Scan each item to build the order, then take cash or card payment.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/staff/lookup")}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <Text className="text-4xl">🎬</Text>
          <Text className="mt-3 text-xl font-extrabold text-slate-900">
            Product lookup &amp; video
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            Scan a firework to show the customer its demo video and details.
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
