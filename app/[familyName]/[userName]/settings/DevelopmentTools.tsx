"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAllTransactions, deleteAllAllowanceSettings } from "./actions"
import { useState } from "react"

interface Props {
  userId: string
}

export function DevelopmentTools({ userId }: Props) {
  const { toast } = useToast()
  const [weeks, setWeeks] = useState(4)

  const handleGenerateTest = async () => {
    try {
      const response = await fetch('/api/test-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, weeks }),
      })
      
      if (!response.ok) throw new Error('Failed to generate test transactions')
      
      toast({
        title: "Test data generated",
        description: `Test transactions for ${weeks} weeks have been created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate test transactions.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllTransactions({ userId })
      toast({
        title: "Transactions deleted",
        description: "All transactions have been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transactions.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllSettings = async () => {
    try {
      await deleteAllAllowanceSettings({ userId })
      toast({
        title: "Settings deleted",
        description: "All allowance settings have been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete allowance settings.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Development Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="weeks">Number of Weeks</Label>
            <Input
              id="weeks"
              type="number"
              min="1"
              max="52"
              value={weeks}
              onChange={(e) => setWeeks(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
          <Button onClick={handleGenerateTest} variant="secondary">
            Generate Test Transactions
          </Button>
        </div>
        
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete All Transactions</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all transactions
                  for this user.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete All Settings</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all allowance settings
                  for this user.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllSettings}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
