import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const loraSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GNOSIS | Independent Global News & Analysis",
    template: "%s | GNOSIS",
  },
  description:
    "An international digital news publication delivering verified, structured, and insightful reporting across world affairs, politics, technology, science, and culture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${loraSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbfb] dark:bg-[#0a0a0c] text-zinc-900 dark:text-zinc-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
