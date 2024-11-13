import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.email !== 'oren@teich.net') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
        <nav className="space-y-2">
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start pl-0">
              Users
            </Button>
          </Link>
          <Link href="/admin/families">
            <Button variant="ghost" className="w-full justify-start pl-0">
              Families
            </Button>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
} 