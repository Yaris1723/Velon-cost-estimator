import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppContent from "@/components/layout/AppContent";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velon Constructions | Cost Estimator",
  description: "Internal cost estimation and BOQ generation tool for Velon Constructions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background min-h-screen text-foreground`}>
        <AppContent>{children}</AppContent>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
