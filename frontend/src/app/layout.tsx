import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";

import "./globals.css";
import { TopNavbar } from "@/components/navigation/TopNavbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Curated Adventure Atlas",
  description: "Curated adventure travel atlas with interactive world map discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <TopNavbar />
        {children}
      </body>
    </html>
  );
}
