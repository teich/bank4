import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import SignIn from "@/components/sign-in"
import { ThemeToggle } from "@/components/theme-toggle"


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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-lg font-semibold">Allowance Tracking</h1>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <SignIn />
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
