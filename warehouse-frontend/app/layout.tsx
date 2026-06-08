import type { Metadata } from 'next';
import { AuthProvider } from '@/src/auth/AuthProvider';
import { Inter } from 'next/font/google';
import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'WMS',
  description: 'Premium olive oil production powered by intelligent warehouse management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} m-0 flex min-h-full flex-col p-0`}
        style={{ '--font-display': display.style.fontFamily } as React.CSSProperties}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
