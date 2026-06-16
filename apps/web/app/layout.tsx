import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/toast";
import { IS_DEMO } from "@/lib/mode";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Big MO's Bangers — Fireworks Tent",
  description:
    "Big bangs, low prices, great time. Shop premium fireworks and order ahead for pickup in Republic, MO.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <html lang="en" className={`${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );

  // In demo mode there's no Clerk — render without the provider so no key is needed.
  if (IS_DEMO) return body;

  return <ClerkProvider>{body}</ClerkProvider>;
}
