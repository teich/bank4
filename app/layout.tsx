import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import SignIn from "@/components/sign-in";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Allowance Tracking",
  description: "Family allowance tracking app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav style={{
          backgroundColor: '#f0f0f0',
          padding: '1rem',
          borderBottom: '1px solid #ddd'
        }}>
          <SignIn />
        </nav>
        {children}
      </body>
    </html>
  );
}
