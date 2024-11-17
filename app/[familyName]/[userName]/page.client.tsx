"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpIcon, ArrowDownIcon, HeartIcon, PiggyBankIcon, ShoppingCartIcon, PlusIcon, MinusIcon, Settings, Trash2Icon } from "lucide-react"
import { TransactionForm } from './TransactionForm'
import { CATEGORY_ORDER } from '@/lib/constants'
import Link from "next/link"
import { DeleteTransactionButton } from "./DeleteTransactionButton"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "next-themes"
import type { PageData, CategoryType } from "./types"
import { Badge } from "@/components/ui/badge"
import { TransactionTable } from "@/components/transactions/transaction-table"

const categoryIcons = {
    SPENDING: ShoppingCartIcon,
    SAVING: PiggyBankIcon,
    GIVING: HeartIcon,
}

// Define theme-aware category colors
const getCategoryColors = (theme: string | undefined) => ({
    SPENDING: theme === 'dark' 
        ? 'bg-gradient-to-br from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800'
        : 'bg-gradient-to-br from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600',
    SAVING: theme === 'dark'
        ? 'bg-gradient-to-br from-green-950 to-emerald-900 hover:from-green-900 hover:to-emerald-800'
        : 'bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
    GIVING: theme === 'dark'
        ? 'bg-gradient-to-br from-pink-950 to-purple-900 hover:from-pink-900 hover:to-purple-800'
        : 'bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600',
})

// Replace the simple categoryVariants with a function that returns theme-aware variants
const getCategoryBadgeStyles = (theme: string | undefined) => ({
    SPENDING: {
        className: theme === 'dark'
            ? 'bg-blue-950/50 text-blue-200 border-blue-800'
            : 'bg-blue-100 text-blue-700 border-blue-300'
    },
    SAVING: {
        className: theme === 'dark'
            ? 'bg-green-950/50 text-green-200 border-green-800'
            : 'bg-green-100 text-green-700 border-green-300'
    },
    GIVING: {
        className: theme === 'dark'
            ? 'bg-pink-950/50 text-pink-200 border-pink-800'
            : 'bg-pink-100 text-pink-700 border-pink-300'
    }
})

function getAmountFontSize(amount: number): string {
    const amountStr = Math.abs(amount).toString()
    if (amountStr.length > 8) return 'text-3xl'
    if (amountStr.length > 6) return 'text-4xl'
    return 'text-5xl'
}

export function ClientPage({ initialData }: { initialData: PageData }) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL')
    const { theme } = useTheme()
    const categoryColors = getCategoryColors(theme)
    const categoryBadgeStyles = getCategoryBadgeStyles(theme)

    const filteredTransactions = selectedCategory === 'ALL' 
        ? initialData.transactions
        : initialData.transactions.filter(t => t.category === selectedCategory)

    console.log('Passing to TransactionTable:', {
        isParent: initialData.isParent,
        currentUserId: initialData.session.user.id
    })

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="relative mb-8">
                <h1 className="text-3xl font-bold mb-6">
                    {initialData.targetUser.user.name}'s Money Dashboard
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {CATEGORY_ORDER.map((category) => {
                    const Icon = categoryIcons[category]
                    const weeklyChange = initialData.weeklyChangeMap[category]
                    const amount = initialData.categoryTotalMap[category]
                    return (
                        <Card 
                            key={category} 
                            className={`overflow-hidden ${categoryColors[category]} text-foreground dark:text-foreground-dark shadow-lg transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                                selectedCategory === category ? 'ring-4 ring-primary ring-offset-2' : ''
                            }`}
                            onClick={() => setSelectedCategory(selectedCategory === category ? 'ALL' : category)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="bg-background/20 dark:bg-background/10 p-3 rounded-full">
                                        <Icon size={32} className="text-foreground dark:text-foreground-dark" />
                                    </div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider">
                                        {category}
                                    </h3>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`${getAmountFontSize(amount)} font-bold mb-4 truncate`}>
                                        {formatCurrency(amount, initialData.currencySymbol)}
                                    </span>
                                    <div className="flex items-center justify-between pt-3 border-t border-foreground/20 dark:border-foreground/10">
                                        <span className="text-sm font-medium">This Week</span>
                                        <div className="flex items-center">
                                            {weeklyChange > 0 ? (
                                                <ArrowUpIcon size={16} className="mr-1" />
                                            ) : weeklyChange < 0 ? (
                                                <ArrowDownIcon size={16} className="mr-1" />
                                            ) : null}
                                            <span className="text-sm font-semibold">
                                                {formatCurrency(weeklyChange, initialData.currencySymbol)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="shadow-md mb-8">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">Add New Transaction</h2>
                    <TransactionForm 
                        targetUserId={initialData.targetUser.user.id}
                        currencySymbol={initialData.currencySymbol}
                    />
                </CardContent>
            </Card>

            <div className="mt-6">
                <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                <TransactionTable 
                    data={initialData.transactions} 
                    currencySymbol={initialData.currencySymbol}
                    isParent={initialData.isParent}
                    currentUserId={initialData.session.user.id}
                />
            </div>
        </div>
    )
} 