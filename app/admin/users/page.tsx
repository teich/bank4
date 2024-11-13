import { prisma } from "@/lib/prisma"
import { DataTable } from "../components/data-table"
import { columns } from "./columns"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      familyMembers: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <DataTable 
        columns={columns} 
        data={users} 
        filterColumn="email"
        filterPlaceholder="Filter emails..."
      />
    </div>
  )
} 