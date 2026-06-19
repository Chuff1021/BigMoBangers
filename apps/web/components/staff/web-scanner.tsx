"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { RotateCcw } from "lucide-react";

type NativeBarcodeDetector = {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>>;
};

type NativeBarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => NativeBarcodeDetector;

const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 24, max: 30 },
  },
};

const BARCODE_FORMATS = [
  "aztec",
  "codabar",
  "code_39",
  "code_93",
  "code_128",
  "data_matrix",
  "ean_8",
  "ean_13",
  "itf",
  "pdf417",
  "qr_code",
  "upc_a",
  "upc_e",
];

/**
 * Browser camera barcode scanner. Uses the browser-native BarcodeDetector when
 * available, with ZXing as a fallback for iOS/Safari and older browsers.
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
  const flashTimerRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  function reportScan(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;

    const now = Date.now();
    const last = lastRef.current;
    if (trimmed === last.code && now - last.t < 750) return;
    lastRef.current = { code: trimmed, t: now };

    setFlash(true);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlash(false), 180);
    onScanRef.current(trimmed);
  }

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let controls: { stop: () => void } | undefined;
    let stream: MediaStream | undefined;
    let loopTimer: number | undefined;
    let decoding = false;
    const reader = new BrowserMultiFormatReader();

    async function startNativeScanner(detector: NativeBarcodeDetector) {
      const video = videoRef.current;
      if (!video) return;

      stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      if (cancelled) return;

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const scanLoop = async () => {
        if (cancelled) return;

        if (!document.hidden && !decoding && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          decoding = true;
          try {
            const results = await detector.detect(video);
            const code = results[0]?.rawValue;
            if (code) reportScan(code);
          } catch {
            // Individual decode failures are normal while the camera is moving.
          } finally {
            decoding = false;
          }
        }

        loopTimer = window.setTimeout(scanLoop, 120);
      };

      loopTimer = window.setTimeout(scanLoop, 180);
    }

    async function startZxingScanner() {
      controls = await reader.decodeFromConstraints(
        VIDEO_CONSTRAINTS,
        videoRef.current!,
        (result) => {
          if (!result) return;
          reportScan(result.getText());
        }
      );
      if (cancelled) controls.stop();
    }

    (async () => {
      try {
        setError(null);
        const BarcodeDetectorCtor = (window as unknown as {
          BarcodeDetector?: NativeBarcodeDetectorConstructor;
        }).BarcodeDetector;

        if (BarcodeDetectorCtor) {
          await startNativeScanner(new BarcodeDetectorCtor({ formats: BARCODE_FORMATS }));
        } else {
          await startZxingScanner();
        }
      } catch {
        setError("Camera unavailable — allow camera access and reload.");
      }
    })();

    return () => {
      cancelled = true;
      if (loopTimer) window.clearTimeout(loopTimer);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      stream?.getTracks().forEach((track) => track.stop());
      controls?.stop();
    };
  }, [active, restartKey]);

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
      <button
        type="button"
        onClick={() => setRestartKey((key) => key + 1)}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"
        aria-label="Restart camera"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      {error && (
        <div className="absolute inset-x-3 bottom-3 rounded-lg bg-usared px-3 py-2 text-center text-sm font-semibold text-white">
          {error}
        </div>
      )}
    </div>
  );
}
