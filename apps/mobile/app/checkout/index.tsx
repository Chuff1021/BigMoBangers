import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCart, TAX_RATE } from "@/lib/cart";
import { money } from "@/lib/format";

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  multiline,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-slate-700">
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        multiline={multiline}
        className={`rounded-xl border border-slate-200 bg-white px-4 py-3 text-base ${
          multiline ? "h-24" : ""
        }`}
        style={multiline ? { textAlignVertical: "top" } : undefined}
      />
    </View>
  );
}

export default function CheckoutContactScreen() {
  const router = useRouter();
  const subtotal = useCart((s) => s.total());
  const items = useCart((s) => s.items);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const total = subtotal + subtotal * TAX_RATE;

  function proceed() {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError("");
    router.push({
      pathname: "/checkout/payment",
      params: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        note: note.trim(),
      },
    });
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-4">
      <Text className="mb-1 text-xl font-extrabold text-slate-900">
        Contact & Pickup
      </Text>
      <Text className="mb-5 text-sm text-slate-500">
        We'll text you when your order is ready for pickup.
      </Text>

      <Field label="Name" value={name} onChange={setName} required placeholder="Your name" />
      <Field
        label="Phone"
        value={phone}
        onChange={setPhone}
        placeholder="417-555-0100"
        keyboardType="phone-pad"
      />
      <Field
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
      />
      <Field
        label="Pickup note"
        value={note}
        onChange={setNote}
        placeholder="Any special instructions?"
        multiline
      />

      {error ? <Text className="mb-3 text-sm text-red-500">{error}</Text> : null}

      <View className="mb-4 rounded-xl bg-white p-4">
        <View className="flex-row justify-between">
          <Text className="font-bold">Total due at pickup</Text>
          <Text className="font-bold">{money(total)}</Text>
        </View>
      </View>

      <Pressable
        onPress={proceed}
        className="items-center rounded-xl bg-brand py-4"
      >
        <Text className="text-base font-bold text-white">Continue to Payment</Text>
      </Pressable>
    </ScrollView>
  );
}
