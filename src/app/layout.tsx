import type { Metadata } from 'next';
import { Providers } from './providers';
import { Inter } from 'next/font/google';
import './globals.css';

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Ehsan's Storybook",
  description:
    'A passionate developer, competitive programmer and quick learner. Love to code and learn new things.',
  other: { 'darkreader-lock': 'dark', 'color-scheme': 'dark', theme: 'dark' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
