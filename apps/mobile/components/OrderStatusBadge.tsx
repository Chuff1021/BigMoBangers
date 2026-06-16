import { Text, View } from "react-native";

const STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-slate-200", text: "text-slate-700", label: "Pending" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed" },
  ready: { bg: "bg-green-100", text: "text-green-700", label: "Ready" },
  completed: { bg: "bg-slate-300", text: "text-slate-800", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.pending;
  return (
    <View className={`self-start rounded-full px-3 py-1 ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
    </View>
  );
}
