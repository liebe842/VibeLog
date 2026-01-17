import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // Corrected import
import "./globals.css";
import { cn } from "@/lib/utils"; // Assuming we will create this

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "VibeLog",
  description: "Dev Challenge Coding Feed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" class="dark">
      <body className={cn(inter.variable, jetbrainsMono.variable, "bg-background-dark font-display antialiased")}>
        {children}
      </body>
    </html>
  );
}
