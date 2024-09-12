import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpIcon, ArrowDownIcon, HeartIcon, PiggyBankIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from "lucide-react"

export default function Dashboard() {
  const categories = [
    { name: 'Giving', icon: HeartIcon, total: 50, weeklyChange: 10, color: 'bg-gradient-to-br from-pink-400 to-purple-500', textColor: 'text-pink-100' },
    { name: 'Savings', icon: PiggyBankIcon, total: 200, weeklyChange: 25, color: 'bg-gradient-to-br from-green-400 to-emerald-500', textColor: 'text-green-100' },
    { name: 'Spendings', icon: ShoppingCartIcon, total: -75, weeklyChange: -15, color: 'bg-gradient-to-br from-blue-400 to-indigo-500', textColor: 'text-blue-100' },
  ]

  const transactions = [
    { id: 1, date: '2023-06-01', description: 'Donated to charity', amount: -10, category: 'Giving' },
    { id: 2, date: '2023-06-02', description: 'Allowance', amount: 25, category: 'Savings' },
    { id: 3, date: '2023-06-03', description: 'Bought ice cream', amount: -5, category: 'Spendings' },
    { id: 4, date: '2023-06-04', description: 'Birthday money', amount: 50, category: 'Savings' },
    { id: 5, date: '2023-06-05', description: 'Bought a game', amount: -20, category: 'Spendings' },
  ]

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount).toFixed(2)
    return `$${absAmount}`
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Money Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.name} className={`overflow-hidden ${category.color} text-white shadow-lg transform transition-all duration-300 hover:scale-105`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {React.createElement(category.icon, { size: 32, className: 'text-white' })}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">{category.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold mb-2">
                  {category.total < 0 && '-'}
                  {formatAmount(category.total)}
                </span>
                <div className="flex items-center text-sm">
                  {category.weeklyChange >= 0 ? (
                    <ArrowUpIcon className="mr-1" size={14} />
                  ) : (
                    <ArrowDownIcon className="mr-1" size={14} />
                  )}
                  <span>
                    {category.weeklyChange < 0 && '-'}
                    {formatAmount(category.weeklyChange)} this week
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-md mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Add New Transaction</h2>
          <form className="flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[120px] max-w-[200px]">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <Input id="amount" type="number" placeholder="0.00" className="pl-6" step="0.01" />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              </div>
            </div>
            <div className="flex-grow">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input id="description" placeholder="Enter description" />
            </div>
            <div className="w-40">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name.toLowerCase()}>
                      <span className="flex items-center">
                        {React.createElement(category.icon, { size: 16, className: 'mr-2' })}
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                const category = categories.find(c => c.name === transaction.category)
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
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
                      <span className={`flex items-center ${category?.color} text-white px-2 py-1 rounded-full text-xs`}>
                        {React.createElement(category?.icon, { size: 12, className: 'mr-1' })}
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