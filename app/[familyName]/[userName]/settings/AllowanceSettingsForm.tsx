"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HeartIcon, PiggyBankIcon, ShoppingCartIcon } from "lucide-react"
import { AllowanceSetting, Category, Currency } from "@prisma/client"
import { saveAllowanceSettings } from "./actions"
import { useToast } from "@/hooks/use-toast"

type CategorySettings = {
  category: Category
  amount: number
}

type AllowanceSettingWithCreator = AllowanceSetting & {
  createdBy: {
    name: string
  }
}

type Props = {
  initialSettings: AllowanceSettingWithCreator[]
  familyId: string
  userId: string
  currency: Currency
}

export default function AllowanceSettingsForm({ initialSettings, familyId, userId, currency }: Props) {
  const [settings, setSettings] = useState<CategorySettings[]>(
    initialSettings.length > 0
      ? initialSettings
          .filter((setting, index, self) =>
            index === self.findIndex((t) => t.category === setting.category)
          )
          .map(setting => ({
            category: setting.category,
            amount: setting.amount,
          }))
      : [
          { category: "SPENDING", amount: 5 },
          { category: "SAVING", amount: 20 },
          { category: "GIVING", amount: 5 },
        ]
  )
  const { toast } = useToast()

  const categories = [
    { 
      name: 'SPENDING', 
      icon: ShoppingCartIcon, 
      color: 'text-purple-500',
      label: 'Weekly Spending'
    },
    { 
      name: 'SAVING', 
      icon: PiggyBankIcon, 
      color: 'text-green-500',
      label: 'Annual Savings'
    },
    { 
      name: 'GIVING', 
      icon: HeartIcon, 
      color: 'text-pink-500',
      label: 'Weekly Giving'
    },
  ]

  const handleAmountChange = (index: number, value: number) => {
    setSettings(prev => prev.map((setting, i) => 
      i === index ? { ...setting, amount: value } : setting
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveAllowanceSettings({
        familyId,
        userId,
        settings: settings.map(({ category, amount }) => ({
          category,
          amount,
          // Set fixed values based on category
          period: category === "SAVING" ? "YEAR" : "WEEK",
          isPercentage: category === "SAVING"
        }))
      })
      toast({
        title: "Settings saved",
        description: "Your allowance settings have been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allowance Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting, index) => {
              const category = categories.find(c => c.name === setting.category)!
              const isSaving = setting.category === "SAVING"
              return (
                <div key={setting.category} className="flex items-center space-x-4">
                  <div className="w-48 flex items-center">
                    {React.createElement(category.icon, { className: `mr-2 ${category.color}`, size: 24 })}
                    <span className="font-medium whitespace-nowrap">{category.label}</span>
                  </div>
                  <div className="relative w-32">
                    {!isSaving && (
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        $
                      </span>
                    )}
                    <Input
                      type="number"
                      value={setting.amount}
                      onChange={(e) => handleAmountChange(index, parseFloat(e.target.value))}
                      className={isSaving ? 'pr-6 text-right' : 'pl-8 text-right'}
                    />
                    {isSaving && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        %
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            <Button type="submit" className="w-full mt-4">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Changed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSettings.map((setting, index) => (
                <TableRow key={index}>
                  <TableCell>{setting.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{setting.category}</TableCell>
                  <TableCell>
                    {setting.category === "SAVING" 
                      ? `${setting.amount}% per year` 
                      : `$${setting.amount} per week`}
                  </TableCell>
                  <TableCell>{setting.createdBy.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </form>
  )
}