"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

// ... other actions ...

export async function deleteTransaction({ id }: { id: string }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      family: {
        include: {
          members: {
            where: { userId: session.user.id },
            select: { role: true }
          }
        }
      }
    }
  })

  if (!transaction) throw new Error("Transaction not found")

  // Check if user is parent or transaction creator
  const isParent = transaction.family.members[0]?.role === "PARENT"
  const isCreator = transaction.createdById === session.user.id

  if (!isParent && !isCreator) {
    throw new Error("Not authorized to delete this transaction")
  }

  await prisma.transaction.delete({ where: { id } })
  
  revalidatePath("/[familyName]/[userName]")
} 