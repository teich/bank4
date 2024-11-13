'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Category } from "@prisma/client"

export async function addTransaction(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) {
        return { message: "Not authenticated" }
    }

    const amount = parseFloat(formData.get("amount") as string) * 100 // Convert to cents
    const description = formData.get("description") as string
    const category = formData.get("category") as Category // Type assertion to Category enum
    const targetUserId = formData.get("targetUserId") as string

    try {
        // First, find the family ID for the target user
        const familyMember = await prisma.familyMember.findFirst({
            where: {
                userId: targetUserId
            },
            select: {
                familyId: true
            }
        })

        if (!familyMember) {
            return { message: "Family not found" }
        }

        await prisma.transaction.create({
            data: {
                amount,
                description,
                category,
                date: new Date(),
                owner: {
                    connect: { id: targetUserId }
                },
                createdBy: {
                    connect: { id: session.user.id }
                },
                family: {
                    connect: { id: familyMember.familyId }
                }
            }
        })

        revalidatePath("/[familyName]/[userName]")
        return { message: null }
    } catch (error) {
        console.error('Transaction creation error:', error)
        return { message: "Failed to add transaction" }
    }
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const transactionId = formData.get('transactionId') as string
  const familyName = formData.get('familyName') as string
  const userName = formData.get('userName') as string

  if (!transactionId || !familyName || !userName) {
    throw new Error("Missing required fields")
  }

  // Get the family member to check permissions
  const familyMember = await prisma.familyMember.findFirst({
    where: {
      userId: session.user.id,
      family: { name: { equals: familyName, mode: 'insensitive' } }
    },
    include: {
      family: true
    }
  })

  if (!familyMember) throw new Error("Family member not found")

  // Get the transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })

  if (!transaction) throw new Error("Transaction not found")

  // Check permissions:
  // Allow if user is a parent OR if user is the transaction owner
  const canDelete = familyMember.role === "PARENT" || 
                    transaction.ownerId === session.user.id

  if (!canDelete) throw new Error("Unauthorized to delete this transaction")

  // Delete the transaction
  await prisma.transaction.delete({
    where: { id: transactionId }
  })

  revalidatePath(`/${familyName}/${userName}`)
}