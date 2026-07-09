import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mhadys - Build Better Products",
  description: "All-in-one platform for teams to collaborate, automate workflows, and scale their business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full antialiased`}
    >
      <body className="h-full w-full flex flex-col relative overflow-x-hidden glass">
        {/* Liquid glass animated background - full viewport */}
        <div className="fixed inset-0 -z-20 w-full h-full overflow-hidden pointer-events-none">
          {/* Base gradient mesh */}
          <div className="absolute inset-0 liquid-gradient opacity-30 dark:opacity-20" />

          {/* Animated orbs */}
          <div className="glass-orb glass-orb-1" />
          <div className="glass-orb glass-orb-2" />
          <div className="glass-orb glass-orb-3" />
          <div className="glass-orb glass-orb-4" />
          <div className="glass-orb glass-orb-5" />
        </div>

        {/* Noise texture overlay for realistic glass */}
        <div className="noise-overlay" />

        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full w-full">
          {children}
        </div>

        <Toaster />
      </body>
    </html>
  );
}
