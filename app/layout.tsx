import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import SignIn from "@/components/sign-in"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

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
  let userName: string | null = null

  if (session?.user?.email) {
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true }
    })
    userName = user?.name || null
  }

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
                <ThemeToggle />
                {userName && (
                  <Link 
                    href="/profile" 
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {userName}
                  </Link>
                )}
                <SignIn showName={false} />
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
