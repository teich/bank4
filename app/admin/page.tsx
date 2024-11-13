import { redirect } from "next/navigation"

export default function AdminPage() {
  redirect('/admin/users')
  return null // This line will never execute due to the redirect
} 