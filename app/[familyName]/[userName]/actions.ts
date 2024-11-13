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