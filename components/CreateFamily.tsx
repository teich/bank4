'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import debounce from 'lodash/debounce'

export default function CreateFamily() {
  const [familyName, setFamilyName] = useState('')
  const [isAvailable, setIsAvailable] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const checkFamilyName = useCallback(
    debounce(async (name: string) => {
      if (name.length === 0) {
        setIsAvailable(false)
        setIsChecking(false)
        return
      }
      setIsChecking(true)
      const response = await fetch(`/api/check-family-name?name=${encodeURIComponent(name)}`)
      const data = await response.json()
      setIsAvailable(data.isAvailable)
      setIsChecking(false)
    }, 300),
    []
  )

  useEffect(() => {
    checkFamilyName(familyName)
  }, [familyName, checkFamilyName])

  const createFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAvailable) {
      const response = await fetch('/api/create-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName }),
      })
      console.log("step 1,", familyName)
      const data = await response.json()
      console.log("step 2")
      if (data.success) {
        router.push(`/${familyName}/settings`)
      }
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Family</CardTitle>
      </CardHeader>
      <form onSubmit={createFamily}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Enter family name"
              />
            </div>
            {isChecking && <p className="text-sm text-muted-foreground">Checking availability...</p>}
            {!isChecking && familyName.length > 0 && isAvailable && <p className="text-sm text-green-600">Family name is available!</p>}
            {!isChecking && familyName.length > 0 && !isAvailable && <p className="text-sm text-red-600">Family name is not available.</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!isAvailable || familyName.length === 0}>
            Create Family
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}