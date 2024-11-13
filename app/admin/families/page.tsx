import { prisma } from "@/lib/prisma"
import { DataTable } from "../components/data-table"
import { columns } from "./columns"

export default async function FamiliesPage() {
  const families = await prisma.family.findMany({
    include: {
      members: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Families</h1>
      <DataTable 
        columns={columns} 
        data={families}
        filterColumn="name"
        filterPlaceholder="Filter family names..."
      />
    </div>
  )
} 