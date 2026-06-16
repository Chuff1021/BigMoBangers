import { Pressable, Text } from "react-native";

export function CategoryPill({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string | null;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 flex-row items-center rounded-full border px-4 py-2 ${
        selected ? "border-brand bg-brand" : "border-slate-200 bg-white"
      }`}
    >
      {emoji ? <Text className="mr-1 text-base">{emoji}</Text> : null}
      <Text
        className={`text-sm font-semibold ${
          selected ? "text-white" : "text-slate-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
