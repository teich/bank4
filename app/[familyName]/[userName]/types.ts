import type { Category } from "@prisma/client"

export type CategoryType = Category | 'ALL'

export interface PageData {
    session: {
        user: {
            id: string
        }
    }
    params: {
        familyName: string
        userName: string
    }
    familyMember: {
        role: string
        user: {
            id: string
            name: string | null
            username: string | null
        }
        family: {
            id: string
            name: string
            currency: string
            members: Array<{
                user: {
                    id: string
                    name: string | null
                    username: string | null
                }
            }>
        }
    }
    targetUser: {
        user: {
            id: string
            name: string | null
            username: string | null
        }
    }
    isViewingSelf: boolean
    isParent: boolean
    transactions: Array<{
        id: string
        description: string
        date: Date
        amount: number
        category: Category
        createdById: string
        ownerId: string
        familyId: string
        isSystemCreated: boolean
        createdAt: Date
        updatedAt: Date
        createdBy: {
            id: string
            name: string | null
        }
    }>
    categoryTotalMap: {
        [key in Category]: number
    }
    weeklyChangeMap: {
        [key in Category]: number
    }
    currencySymbol: string
}