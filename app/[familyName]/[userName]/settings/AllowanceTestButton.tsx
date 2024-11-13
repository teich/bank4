"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Props {
  userId: string
}

export function AllowanceTestButton({ userId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [weeks, setWeeks] = useState(1)
  const { toast } = useToast()

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  const runTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/allowance/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          weeksToSimulate: weeks
        })
      })

      const data = await response.json()

      if (!data.success) throw new Error(data.error)

      toast({
        title: "Test Completed",
        description: `Simulated ${data.weeksSimulated} weeks of allowance`,
      })

    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 mt-4 border rounded-lg bg-muted">
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">Development Testing</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max="52"
            value={weeks}
            onChange={(e) => setWeeks(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">weeks</span>
        </div>
      </div>
      <Button 
        onClick={runTest} 
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? "Running..." : "Run Test"}
      </Button>
    </div>
  )
} 