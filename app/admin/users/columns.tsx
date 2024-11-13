"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User, FamilyMember } from "@prisma/client"

interface UserWithFamilies extends User {
  familyMembers: FamilyMember[]
}

export type { UserWithFamilies }

export const columns: ColumnDef<UserWithFamilies>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    accessorKey: "familyMembers",
    header: "Families",
    cell: ({ row }) => {
      return row.original.familyMembers.length
    },
  },
] 