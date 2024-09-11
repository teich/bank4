'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createFamily } from '@/app/actions/familyActions'
import { useRouter } from 'next/navigation'
import { checkFamilyNameAvailability } from '@/app/actions/familyActions'
import { debounce } from 'lodash'

export function CreateFamilyModal() {
  const [familyName, setFamilyName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const checkAvailability = useCallback(
    debounce(async (name: string) => {
      if (name.length === 0) {
        setIsAvailable(null)
        return
      }
      setIsChecking(true)
      try {
        const available = await checkFamilyNameAvailability(name)
        setIsAvailable(available)
      } catch (error) {
        console.error('Failed to check family name availability:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    checkAvailability(familyName)
  }, [familyName, checkAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAvailable) return

    try {
      await createFamily({ name: familyName })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create family:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Family</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="familyName">Family Name</Label>
            <Input
              id="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family name"
            />
            {isChecking && <p className="text-sm text-gray-500">Checking availability...</p>}
            {!isChecking && isAvailable === true && <p className="text-sm text-green-500">Family name is available</p>}
            {!isChecking && isAvailable === false && <p className="text-sm text-red-500">Family name is not available</p>}
          </div>
          <Button type="submit" disabled={!isAvailable || isChecking}>Create Family</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}