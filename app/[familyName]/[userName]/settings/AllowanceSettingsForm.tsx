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
import { useTheme } from "next-themes"
import { DevelopmentTools } from "./DevelopmentTools"

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
            amount: setting.amount / 100,
          }))
      : [
          { category: "SPENDING", amount: 5 },
          { category: "SAVING", amount: 20 },
          { category: "GIVING", amount: 5 },
        ]
  )
  const { toast } = useToast()
  const { theme } = useTheme()

  const categories = [
    { 
      name: 'SPENDING', 
      icon: ShoppingCartIcon, 
      color: theme === 'dark' ? 'text-purple-400' : 'text-purple-500',
      label: 'Weekly Spending'
    },
    { 
      name: 'SAVING', 
      icon: PiggyBankIcon, 
      color: theme === 'dark' ? 'text-green-400' : 'text-green-500',
      label: 'Annual Savings'
    },
    { 
      name: 'GIVING', 
      icon: HeartIcon, 
      color: theme === 'dark' ? 'text-pink-400' : 'text-pink-500',
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
          amount: Math.round(amount * 100),
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
    <div>
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
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
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
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
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
      </form>
      
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
                  <TableCell>
                    <div className="flex items-center">
                      {React.createElement(
                        categories.find(c => c.name === setting.category)!.icon,
                        { className: categories.find(c => c.name === setting.category)!.color, size: 16 }
                      )}
                      <span className="ml-2">{setting.category}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {setting.category === "SAVING" 
                      ? `${setting.amount / 100}% per year` 
                      : `$${(setting.amount / 100).toFixed(2)} per week`}
                  </TableCell>
                  <TableCell>{setting.createdBy.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {process.env.NODE_ENV === "development" && (
        <DevelopmentTools userId={userId} />
      )}
    </div>
  )
}