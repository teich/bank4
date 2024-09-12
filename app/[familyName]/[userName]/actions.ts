'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { Category } from "@prisma/client"

export async function addTransaction(formData: FormData) {
    const session = await auth()
    if (!session || !session.user) {
        throw new Error("Not authenticated")
    }

    const amount = formData.get('amount')
    const description = formData.get('description')
    const category = formData.get('category')
    const targetUserId = formData.get('targetUserId')

    if (!amount || !description || !category || !targetUserId) {
        throw new Error("Missing required fields")
    }

    const amountInCents = Math.round(parseFloat(amount.toString()) * 100)

    const userId = session.user.id
    if (!userId) {
        throw new Error("User ID is missing")
    }

    try {
        const familyMember = await prisma.familyMember.findFirst({
            where: { userId: session.user.id },
            include: { 
                family: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, username: true }
                                }
                            }
                        }
                    }
                } 
            }
        })

        if (!familyMember) {
            throw new Error("Family member not found")
        }

        // Check if the target user is in the same family
        const targetUser = familyMember.family.members.find(member => member.user.id === targetUserId.toString())
        if (!targetUser) {
            throw new Error("Target user is not in the same family")
        }

        // Check if the logged-in user is a parent or the target user
        const isParent = familyMember.role === "PARENT"
        const isTargetUser = session.user.id === targetUserId.toString()

        if (!isParent && !isTargetUser) {
            throw new Error("Not authorized to add transaction for this user")
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                amount: amountInCents,
                description: description.toString(),
                category: category.toString().toUpperCase() as Category,
                date: new Date(),
                createdById: userId,
                ownerId: targetUserId.toString(),
                familyId: familyMember.family.id
            }
        })

        // Use username for revalidation
        if (targetUser.user.username) {
            revalidatePath(`/${familyMember.family.name}/${targetUser.user.username}`)
        } else {
            // Fallback to user's ID if username is not available
            revalidatePath(`/${familyMember.family.name}/${targetUser.user.id}`)
        }

        return { success: true, transaction: newTransaction }
    } catch (error) {
        console.error('Failed to add transaction:', error)
        return { success: false, error: "Failed to add transaction" }
    }
}