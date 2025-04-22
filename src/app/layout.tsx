import type { Metadata } from 'next';
// Supports weights 100-900
//import '@fontsource-variable/roboto';
import { Nunito } from 'next/font/google';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'OGKIFY',
  description: 'OGKIFY',
};

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${ptSans.variable} font-sans`}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
