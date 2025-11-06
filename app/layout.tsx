import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { AuthSessionProvider } from '@/components/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Báo cáo Thần số học',
  description:
    'Đăng nhập bằng Google, nhập thông tin cá nhân và nhận báo cáo thần số học chi tiết dưới dạng PDF, DOCX và email.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthSessionProvider session={session}>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
