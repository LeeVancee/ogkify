import type { Metadata } from 'next';
// Supports weights 100-900
import '@fontsource-variable/roboto';

import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'OGKIFY',
  description: 'OGKIFY',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
