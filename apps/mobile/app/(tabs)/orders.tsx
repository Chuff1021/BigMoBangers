import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { money } from "@/lib/format";

export default function OrdersScreen() {
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading, isError } = useOrders(phone);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <View className="px-4 pt-2">
        <Text className="text-2xl font-extrabold text-slate-900">My Orders</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Enter your phone number to find your pickup orders.
        </Text>
        <View className="mt-3 flex-row">
          <TextInput
            value={phoneInput}
            onChangeText={setPhoneInput}
            placeholder="417-555-0100"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base"
          />
          <Pressable
            onPress={() => setPhone(phoneInput.trim())}
            className="ml-2 items-center justify-center rounded-xl bg-brand px-5"
          >
            <Text className="font-bold text-white">Find</Text>
          </Pressable>
        </View>
      </View>

      {isLoading && phone !== "" && (
        <ActivityIndicator className="mt-8" color="#FF4500" />
      )}
      {isError && (
        <Text className="mt-6 px-4 text-center text-red-500">
          Could not load orders. Try again.
        </Text>
      )}

      <ScrollView contentContainerClassName="px-4 pt-4 pb-8">
        {phone !== "" && orders && orders.length === 0 && !isLoading && (
          <Text className="mt-6 text-center text-slate-500">
            No orders found for that number.
          </Text>
        )}

        {orders?.map((o) => {
          const open = expanded === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => setExpanded(open ? null : o.id)}
              className="mb-3 rounded-2xl border border-slate-100 bg-white p-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-slate-900">{o.orderNumber}</Text>
                <OrderStatusBadge status={o.status} />
              </View>
              <Text className="mt-1 text-sm text-slate-500">
                {new Date(o.createdAt).toLocaleString()} · {money(o.total)}
              </Text>

              {open && (
                <View className="mt-3 border-t border-slate-100 pt-3">
                  {o.items.map((it) => (
                    <View key={it.id} className="flex-row justify-between py-0.5">
                      <Text className="text-slate-700">
                        {it.quantity}× {it.productName}
                      </Text>
                      <Text className="text-slate-700">{money(it.lineTotal)}</Text>
                    </View>
                  ))}
                  {o.pickupNote ? (
                    <Text className="mt-2 text-xs text-slate-500">
                      📝 {o.pickupNote}
                    </Text>
                  ) : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
