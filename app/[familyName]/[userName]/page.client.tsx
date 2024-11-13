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
import { formatAmount } from "@/lib/utils"
import type { PageData, CategoryType } from "./types"

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

export function ClientPage({ initialData }: { initialData: PageData }) {
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL')

    const filteredTransactions = selectedCategory === 'ALL' 
        ? initialData.transactions
        : initialData.transactions.filter(t => t.category === selectedCategory)

    return (
        <div className="max-w-7xl mx-auto bg-background min-h-screen">
            <div className="relative mb-8">
                <h1 className="text-4xl font-bold text-center text-foreground">
                    {initialData.isViewingSelf ? "My Money Dashboard" : `${initialData.targetUser.user.name}'s Money Dashboard`}
                </h1>
                
                {initialData.isParent && (
                    <Link
                        href={`/${initialData.params.familyName}/${initialData.params.userName}/settings`}
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
                    const weeklyChange = initialData.weeklyChangeMap[category]
                    return (
                        <Card 
                            key={category} 
                            className={`overflow-hidden ${categoryColors[category]} text-white shadow-lg transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                                selectedCategory === category ? 'ring-4 ring-primary ring-offset-2' : ''
                            }`}
                            onClick={() => setSelectedCategory(selectedCategory === category ? 'ALL' : category)}
                        >
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
                                        {formatAmount(initialData.categoryTotalMap[category], initialData.currencySymbol)}
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
                                                {formatAmount(weeklyChange, initialData.currencySymbol)}
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
                        targetUserId={initialData.targetUser.user.id}
                        currencySymbol={initialData.currencySymbol}
                    />
                </CardContent>
            </Card>

            <Card className="shadow-md w-full">
                <CardContent className="p-6 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-foreground">Transaction Log</h2>
                        <Select 
                            value={selectedCategory} 
                            onValueChange={(value) => setSelectedCategory(value as CategoryType)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {CATEGORY_ORDER.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        <div className="flex items-center">
                                            {React.createElement(categoryIcons[category], { 
                                                size: 16, 
                                                className: "mr-2" 
                                            })}
                                            {category}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-foreground/70">Date</TableHead>
                                <TableHead className="text-foreground/70">Description</TableHead>
                                <TableHead className="text-foreground/70">Amount</TableHead>
                                <TableHead className="text-foreground/70">Category</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((transaction) => {
                                const Icon = categoryIcons[transaction.category]
                                const canDelete = initialData.isParent || transaction.ownerId === initialData.session.user.id
                                
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
                                                {formatAmount(Math.abs(transaction.amount), initialData.currencySymbol)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`flex items-center ${categoryColors[transaction.category]} text-white px-2 py-1 rounded-full text-xs`}>
                                                <Icon size={12} className="mr-1" />
                                                {transaction.category}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {canDelete && (
                                                <DeleteTransactionButton
                                                    transactionId={transaction.id}
                                                    familyName={initialData.params.familyName}
                                                    userName={initialData.params.userName}
                                                    description={transaction.description}
                                                    amount={transaction.amount}
                                                    currencySymbol={initialData.currencySymbol}
                                                />
                                            )}
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