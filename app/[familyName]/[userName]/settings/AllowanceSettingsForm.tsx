"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HeartIcon, PiggyBankIcon, ShoppingCartIcon, DollarSignIcon, PercentIcon } from "lucide-react"
import { AllowanceSetting, Category, AllowancePeriod, Currency } from "@prisma/client"
import { saveAllowanceSettings } from "./actions"
import { useToast } from "@/hooks/use-toast"

type CategorySettings = {
  category: Category
  amount: number
  period: AllowancePeriod
  isPercentage: boolean
}

type Props = {
  initialSettings: AllowanceSetting[]
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
            period: setting.period,
            isPercentage: setting.isPercentage
          }))
      : [
          { category: "SPENDING", amount: 5, period: "WEEK", isPercentage: false },
          { category: "SAVING", amount: 20, period: "MONTH", isPercentage: true },
          { category: "GIVING", amount: 10, period: "MONTH", isPercentage: true },
        ]
  )
  const { toast } = useToast()

  const categories = [
    { name: 'SPENDING', icon: ShoppingCartIcon, color: 'text-purple-500' },
    { name: 'SAVING', icon: PiggyBankIcon, color: 'text-green-500' },
    { name: 'GIVING', icon: HeartIcon, color: 'text-pink-500' },
  ]

  const handleSettingChange = (index: number, field: keyof CategorySettings, value: any) => {
    setSettings(prev => prev.map((setting, i) => 
      i === index ? { ...setting, [field]: value } : setting
    ))
  }

  const handleTypeToggle = (index: number) => {
    setSettings(prev => prev.map((setting, i) => 
      i === index ? { ...setting, isPercentage: !setting.isPercentage } : setting
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveAllowanceSettings({
        familyId,
        userId,
        settings: settings.map(({ category, amount, period, isPercentage }) => ({
          category,
          amount,
          period,
          isPercentage
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
              return (
                <div key={setting.category} className="flex items-center space-x-4">
                  <div className="w-28 flex items-center">
                    {React.createElement(category.icon, { className: `mr-2 ${category.color}`, size: 24 })}
                    <span className="font-medium">{setting.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSignIcon className={!setting.isPercentage ? category.color : 'text-gray-400'} size={16} />
                    <Switch
                      checked={setting.isPercentage}
                      onCheckedChange={() => handleTypeToggle(index)}
                    />
                    <PercentIcon className={setting.isPercentage ? category.color : 'text-gray-400'} size={16} />
                  </div>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={setting.amount}
                      onChange={(e) => handleSettingChange(index, 'amount', parseFloat(e.target.value))}
                      className="pl-6"
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {setting.isPercentage ? '%' : currency}
                    </span>
                  </div>
                  <Select
                    value={setting.period}
                    onValueChange={(value: AllowancePeriod) => handleSettingChange(index, 'period', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEK">Weekly</SelectItem>
                      <SelectItem value="MONTH">Monthly</SelectItem>
                      <SelectItem value="YEAR">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {setting.isPercentage ? `${setting.amount}%` : `${currency}${setting.amount}`} 
                    {` per ${setting.period.toLowerCase()}`}
                  </TableCell>
                  <TableCell>{setting.createdById}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </form>
  )
}