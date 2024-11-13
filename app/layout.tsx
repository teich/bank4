import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import SignIn from "@/components/sign-in"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { UserMenu } from "@/components/user-menu"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Allowance Tracking",
  description: "Family allowance tracking app",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b w-full">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
                Allowance Tracking
              </Link>
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  <UserMenu 
                    user={{
                      name: session.user.name ?? null,
                      email: session.user.email ?? null,
                      image: session.user.image ?? null
                    }} 
                  />
                ) : (
                  <SignIn showName={false} />
                )}
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8 w-full">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
