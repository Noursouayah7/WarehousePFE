import type { Metadata } from 'next';
import { AuthProvider } from '@/src/auth/AuthProvider';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cerebro WMS',
  description: 'Warehouse Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} m-0 p-0`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}