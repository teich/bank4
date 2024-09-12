import React from 'react'
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpIcon, ArrowDownIcon, HeartIcon, PiggyBankIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from "lucide-react"
import { addTransaction } from './actions'

const categoryIcons = {
  GIVING: HeartIcon,
  SAVING: PiggyBankIcon,
  SPENDING: ShoppingCartIcon,
}

const categoryColors = {
  GIVING: 'bg-gradient-to-br from-pink-400 to-purple-500',
  SAVING: 'bg-gradient-to-br from-green-400 to-emerald-500',
  SPENDING: 'bg-gradient-to-br from-blue-400 to-indigo-500',
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
        GIVING: 0,
        SAVING: 0,
        SPENDING: 0,
        ...Object.fromEntries(categoryTotals.map(ct => [ct.category, ct._sum.amount || 0]))
    }

    const formatAmount = (amount: number) => {
        const absAmount = Math.abs(amount / 100).toFixed(2) // Convert cents to dollars
        const symbol = currencySymbols[familyMember.family.currency] || familyMember.family.currency
        return `${symbol}${absAmount}`
    }

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                {isViewingSelf ? "My Money Dashboard" : `${targetUser.user.name}'s Money Dashboard`}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {(Object.keys(categoryTotalMap) as Array<keyof typeof categoryTotalMap>).map((category) => {
                    const Icon = categoryIcons[category]
                    return (
                        <Card key={category} className={`overflow-hidden ${categoryColors[category]} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <Icon size={32} className="text-white" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">{category}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold mb-2">
                                        {formatAmount(categoryTotalMap[category])}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="shadow-md mb-8">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">Add New Transaction</h2>
                    <form action={addTransaction} className="flex flex-wrap items-end gap-4">
                        <div className="flex-grow min-w-[120px] max-w-[200px]">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Amount
                            </label>
                            <div className="relative">
                                <Input id="amount" name="amount" type="number" placeholder="0.00" className="pl-6" step="0.01" required />
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    {currencySymbols[familyMember.family.currency] || familyMember.family.currency}
                                </span>
                            </div>
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <Input id="description" name="description" placeholder="Enter description" required />
                        </div>
                        <div className="w-40">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <Select name="category" required>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categoryIcons).map(([category, Icon]) => (
                                        <SelectItem key={category} value={category}>
                                            <span className="flex items-center">
                                                <Icon size={16} className="mr-2" />
                                                {category}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <input type="hidden" name="targetUserId" value={targetUser.user.id} />
                        <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-all duration-300">
                            Add
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">Transaction Log</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Category</TableHead>
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