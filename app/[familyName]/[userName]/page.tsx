import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ClientPage } from "./page.client"
import type { PageData } from "./types"
import { formatCurrency } from "@/lib/utils"

async function getPageData({ params }: { params: { familyName: string, userName: string } }): Promise<PageData> {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/signin")
    }

    const familyMember = await prisma.familyMember.findFirst({
        where: {
            userId: session.user.id,
            family: { name: { equals: params.familyName, mode: 'insensitive' } }
        },
        include: {
            user: { select: { id: true, name: true, username: true } },
            family: { 
                select: { 
                    id: true, 
                    name: true,
                    currency: true,
                    members: {
                        include: {
                            user: { select: { id: true, name: true, username: true } }
                        }
                    }
                } 
            }
        }
    })

    if (!familyMember) {
        redirect("/")
    }

    const targetUser = familyMember.family.members.find(
        member => member.user.username?.toLowerCase() === params.userName.toLowerCase()
    )

    if (!targetUser) {
        redirect("/")
    }

    const isViewingSelf = targetUser.user.id === session.user.id
    const isParent = familyMember.role === "PARENT"

    if (!isViewingSelf && !isParent) {
        redirect("/")
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            familyId: familyMember.family.id,
            ownerId: targetUser.user.id
        },
        include: {
            createdBy: {
                select: {
                    name: true,
                    id: true
                }
            }
        },
        orderBy: { date: 'desc' }
    })

    const categoryTotals = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
            familyId: familyMember.family.id,
            ownerId: targetUser.user.id
        },
        _sum: {
            amount: true
        }
    })

    const categoryTotalMap = {
        SPENDING: 0,
        SAVING: 0,
        GIVING: 0,
        ...Object.fromEntries(categoryTotals.map(ct => [
            ct.category, 
            Number(ct._sum.amount) || 0
        ]))
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyChanges = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
            familyId: familyMember.family.id,
            ownerId: targetUser.user.id,
            date: {
                gte: oneWeekAgo
            }
        },
        _sum: {
            amount: true
        }
    })

    const weeklyChangeMap = {
        SPENDING: 0,
        SAVING: 0,
        GIVING: 0,
        ...Object.fromEntries(weeklyChanges.map(wc => [
            wc.category, 
            Number(wc._sum.amount) || 0
        ]))
    }

    const currencySymbols: { [key: string]: string } = {
        USD: '$',
        EUR: '€',
        GBP: '£',
    }

    const currencySymbol = currencySymbols[familyMember.family.currency] || familyMember.family.currency

    return {
        session: { user: { id: session.user.id } },
        params,
        familyMember,
        targetUser,
        isViewingSelf,
        isParent,
        transactions,
        categoryTotalMap,
        weeklyChangeMap,
        currencySymbol
    }
}

export default async function Page({ params }: { params: { familyName: string, userName: string } }) {
    const initialData = await getPageData({ params })
    return <ClientPage initialData={initialData} />
}