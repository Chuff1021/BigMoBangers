import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

/**
 * Camera barcode scanner. Calls onScan once per code with a short cooldown so a
 * single barcode in view doesn't fire repeatedly. Handles permission prompting.
 */
export function BarcodeScanner({
  onScan,
  active = true,
}: {
  onScan: (code: string) => void;
  active?: boolean;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastRef = useRef<{ code: string; t: number }>({ code: "", t: 0 });
  const [flash, setFlash] = useState(false);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-8">
        <Text className="text-5xl">📷</Text>
        <Text className="text-center text-base text-white">
          We need camera access to scan barcodes.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="rounded-xl bg-[#c8102e] px-6 py-3"
        >
          <Text className="font-bold text-white">Enable camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 overflow-hidden bg-black">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: [
            "upc_a",
            "upc_e",
            "ean13",
            "ean8",
            "code128",
            "code39",
            "itf14",
            "qr",
          ],
        }}
        onBarcodeScanned={
          active
            ? ({ data }) => {
                const now = Date.now();
                const last = lastRef.current;
                if (data === last.code && now - last.t < 2200) return;
                lastRef.current = { code: data, t: now };
                setFlash(true);
                setTimeout(() => setFlash(false), 250);
                onScan(data);
              }
            : undefined
        }
      />
      {/* Reticle */}
      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <View
          className={`h-44 w-72 rounded-2xl border-2 ${
            flash ? "border-emerald-400" : "border-white/80"
          }`}
        />
        <Text className="mt-4 text-sm font-semibold text-white/80">
          Line up the barcode
        </Text>
      </View>
    </View>
  );
}
