import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";

import "./globals.css";
import { AppFooter } from "@/components/navigation/AppFooter";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { getRequestLocale } from "@/lib/locale.server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Curated Adventure Atlas",
  description: "Curated adventure travel atlas with interactive world map discovery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <TopNavbar />
        {children}
        <AppFooter locale={locale} />
      </body>
    </html>
  );
}
