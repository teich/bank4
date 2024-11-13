import React from 'react'
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpIcon, ArrowDownIcon, HeartIcon, PiggyBankIcon, ShoppingCartIcon, PlusIcon, MinusIcon, Settings } from "lucide-react"
import { addTransaction } from './actions'
import { TransactionForm } from './TransactionForm'
import { CATEGORY_ORDER } from '@/lib/constants'
import Link from "next/link"

const categoryIcons = {
  SPENDING: ShoppingCartIcon,
  SAVING: PiggyBankIcon,
  GIVING: HeartIcon,
}

const categoryColors = {
  SPENDING: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  SAVING: 'bg-gradient-to-br from-green-400 to-emerald-500',
  GIVING: 'bg-gradient-to-br from-pink-400 to-purple-500',
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  // Add more currencies as needed
}

export default async function Page({ params }: { params: { familyName: string, userName: string } }) {
    const session = await auth()
    
    if (!session || !session.user) {
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
        redirect("/") // Redirect to home if user isn't in the family
    }

    const targetUser = familyMember.family.members.find(
        member => member.user.username?.toLowerCase() === params.userName.toLowerCase()
    )

    if (!targetUser) {
        redirect("/") // Redirect to home if target user isn't found in the family
    }

    const isViewingSelf = targetUser.user.id === session.user.id
    const isParent = familyMember.role === "PARENT"

    if (!isViewingSelf && !isParent) {
        redirect("/") // Redirect to home if user is trying to view someone else's data without being a parent
    }

    // Fetch transactions for the target user
    const transactions = await prisma.transaction.findMany({
        where: {
            familyId: familyMember.family.id,
            ownerId: targetUser.user.id
        },
        orderBy: { date: 'desc' },
        take: 10 // Limit to last 10 transactions
    })

    // Calculate totals for each category for the target user
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

    // Create a map of category totals, defaulting to 0 for categories with no transactions
    const categoryTotalMap = {
        SPENDING: 0,
        SAVING: 0,
        GIVING: 0,
        ...Object.fromEntries(categoryTotals.map(ct => [ct.category, ct._sum.amount || 0]))
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Calculate weekly totals for each category
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

    // Create a map of weekly changes, defaulting to 0 for categories with no transactions
    const weeklyChangeMap = {
        SPENDING: 0,
        SAVING: 0,
        GIVING: 0,
        ...Object.fromEntries(weeklyChanges.map(wc => [wc.category, wc._sum.amount || 0]))
    }

    const formatAmount = (amount: number) => {
        const absAmount = Math.abs(amount / 100).toFixed(2) // Convert cents to dollars
        const symbol = currencySymbols[familyMember.family.currency] || familyMember.family.currency
        return `${symbol}${absAmount}`
    }

    return (
        <div className="container mx-auto p-4 bg-background min-h-screen">
            <div className="relative mb-8">
                <h1 className="text-4xl font-bold text-center text-foreground">
                    {isViewingSelf ? "My Money Dashboard" : `${targetUser.user.name}'s Money Dashboard`}
                </h1>
                
                {isParent && (
                    <Link
                        href={`/${params.familyName}/${params.userName}/settings`}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-accent transition-colors duration-200 group"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {CATEGORY_ORDER.map((category) => {
                    const Icon = categoryIcons[category]
                    const weeklyChange = weeklyChangeMap[category]
                    return (
                        <Card key={category} className={`overflow-hidden ${categoryColors[category]} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <Icon size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold uppercase tracking-wider">
                                        {category}
                                    </h3>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-5xl font-bold mb-4">
                                        {formatAmount(categoryTotalMap[category])}
                                    </span>
                                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                                        <span className="text-sm font-medium">This Week</span>
                                        <div className="flex items-center">
                                            {weeklyChange > 0 ? (
                                                <ArrowUpIcon size={16} className="mr-1" />
                                            ) : weeklyChange < 0 ? (
                                                <ArrowDownIcon size={16} className="mr-1" />
                                            ) : null}
                                            <span className="text-sm font-semibold">
                                                {formatAmount(weeklyChange)}
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
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">Add New Transaction</h2>
                    <TransactionForm 
                        targetUserId={targetUser.user.id}
                        currencySymbol={currencySymbols[familyMember.family.currency] || familyMember.family.currency}
                    />
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">Transaction Log</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-foreground/70">Date</TableHead>
                                <TableHead className="text-foreground/70">Description</TableHead>
                                <TableHead className="text-foreground/70">Amount</TableHead>
                                <TableHead className="text-foreground/70">Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => {
                                const Icon = categoryIcons[transaction.category]
                                return (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.date.toISOString().split('T')[0]}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            <span className="flex items-center">
                                                {transaction.amount >= 0 ? (
                                                    <PlusIcon size={12} className="mr-1" />
                                                ) : (
                                                    <MinusIcon size={12} className="mr-1" />
                                                )}
                                                {formatAmount(transaction.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`flex items-center ${categoryColors[transaction.category]} text-white px-2 py-1 rounded-full text-xs`}>
                                                <Icon size={12} className="mr-1" />
                                                {transaction.category}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}