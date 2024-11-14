import { Transaction, User, FamilyMember } from "@prisma/client"

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
    familyMember: FamilyMember & {
        user: Pick<User, "id" | "name" | "username">
        family: {
            id: string
            name: string
            currency: string
            members: Array<{
                user: Pick<User, "id" | "name" | "username">
            }>
        }
    }
    targetUser: {
        user: Pick<User, "id" | "name" | "username">
    }
    isViewingSelf: boolean
    isParent: boolean
    transactions: Transaction[]
    categoryTotalMap: Record<string, number>
    weeklyChangeMap: Record<string, number>
    currencySymbol: string
}

export type CategoryType = 'SPENDING' | 'SAVING' | 'GIVING' | 'ALL' 