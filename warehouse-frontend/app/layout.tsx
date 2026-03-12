import type { Metadata } from 'next';
import { AuthProvider } from '@/src/auth/AuthProvider';
import { DM_Mono } from 'next/font/google';
import './globals.css';

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Cerebro WMS',
  description: 'Warehouse Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmMono.className} m-0 p-0`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}