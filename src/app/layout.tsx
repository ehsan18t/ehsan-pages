import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ehsan's Storybook",
  description:
    "A passionate developer, competitive programmer and quick learner. Love to code and learn new things.",
  other: { "darkreader-lock": "dark", "color-scheme": "dark", theme: "dark" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} main-container`}>{children}</body>
    </html>
  );
}
