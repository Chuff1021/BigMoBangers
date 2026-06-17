"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

/**
 * Browser camera barcode scanner (zxing). Works in phone browsers including
 * iOS Safari. Calls onScan once per code with a short cooldown.
 */
export function WebScanner({
  onScan,
  active = true,
}: {
  onScan: (code: string) => void;
  active?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const lastRef = useRef<{ code: string; t: number }>({ code: "", t: 0 });
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let controls: { stop: () => void } | undefined;
    const reader = new BrowserMultiFormatReader();

    (async () => {
      try {
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current!,
          (result) => {
            if (!result) return;
            const code = result.getText();
            const now = Date.now();
            const last = lastRef.current;
            if (code === last.code && now - last.t < 2200) return;
            lastRef.current = { code, t: now };
            setFlash(true);
            setTimeout(() => setFlash(false), 250);
            onScanRef.current(code);
          }
        );
        if (cancelled) controls.stop();
      } catch {
        setError("Camera unavailable — allow camera access and reload.");
      }
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [active]);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
      />
      {/* reticle */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`h-32 w-56 rounded-xl border-2 transition-colors ${
            flash ? "border-emerald-400" : "border-white/80"
          }`}
        />
        <span className="mt-3 text-sm font-semibold text-white/80">
          Line up the barcode
        </span>
      </div>
      {error && (
        <div className="absolute inset-x-3 bottom-3 rounded-lg bg-usared px-3 py-2 text-center text-sm font-semibold text-white">
          {error}
        </div>
      )}
    </div>
  );
}
