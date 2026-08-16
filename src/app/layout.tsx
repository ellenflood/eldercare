import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import TopNav from "@/components/TopNav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WithYou",
  description: "WithYou",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TopNav />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
