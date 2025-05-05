
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Khám Phá Mê Cung', // Update default title to Vietnamese
  description: 'Hiển thị thuật toán tìm đường trong mê cung.', // Update description to Vietnamese
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi"> {/* Change language to Vietnamese */}
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
