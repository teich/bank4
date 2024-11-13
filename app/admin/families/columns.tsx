"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Family, FamilyMember, User, Role } from "@prisma/client"

interface FamilyWithMembers extends Family {
  members: (FamilyMember & {
    user: User
  })[]
}

export type { FamilyWithMembers }

export const columns: ColumnDef<FamilyWithMembers>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      return row.original.members.length
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const ownerMember = row.original.members.find(member => member.role === Role.PARENT)
      return ownerMember?.user.email || 'No owner'
    },
  },
] 