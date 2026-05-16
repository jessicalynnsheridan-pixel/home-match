import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BrandingProvider } from "@/context/BrandingContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Home Match: Find the Home That Fits Your Life",
  description:
    "A smarter way for buyers to share what they want, what they need, and where they see themselves living next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <BrandingProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </BrandingProvider>
      </body>
    </html>
  );
}
