import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { TwitchLiveBadge } from "@/components/twitch-live-badge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SoloQ Tracker — Clasificación no oficial",
    template: "%s · SoloQ Tracker",
  },
  description:
    "Seguimiento no oficial e independiente del reto SoloQ Challenge: clasificación, estadísticas, evolución de LP y comparador de jugadores.",
  openGraph: {
    type: "website",
    siteName: "SoloQ Tracker",
    title: "SoloQ Tracker — Clasificación no oficial",
    description:
      "Seguimiento no oficial e independiente del reto SoloQ Challenge: clasificación, estadísticas y evolución de LP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloQ Tracker — Clasificación no oficial",
    description:
      "Seguimiento no oficial e independiente del reto SoloQ Challenge: clasificación, estadísticas y evolución de LP.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <NavBar
              liveBadge={
                <Suspense fallback={null}>
                  <TwitchLiveBadge />
                </Suspense>
              }
            />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
