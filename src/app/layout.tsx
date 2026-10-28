import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopSense — AI-Powered Shopping & Retail Intelligence Platform",
  description:
    "Intelligent platform combining AI product discovery, review analysis, demand forecasting, real-time inventory management, and business analytics for modern commerce.",
  keywords: [
    "AI e-commerce",
    "retail intelligence",
    "demand forecasting",
    "inventory management",
    "smart shopping",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
