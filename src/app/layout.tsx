import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jettbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jettbrainsMono",
});

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
      <body className={`${jettbrainsMono.variable} main-container`}>
        {children}
      </body>
    </html>
  );
}
