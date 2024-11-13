"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useParams } from "next/navigation"

interface FamilyMember {
  id: string
  name: string
  username: string
  role: "PARENT" | "CHILD"
}

interface Family {
  id: string
  name: string
  members: FamilyMember[]
}

interface FamilySwitcherProps {
  families: Family[]
  currentFamily: string
  currentUser: string
  isParent: boolean
}

export function FamilySwitcher({ families, currentFamily, currentUser, isParent }: FamilySwitcherProps) {
  const [open, setOpen] = React.useState(false)
  const [familyOpen, setFamilyOpen] = React.useState(false)
  const router = useRouter()

  const currentFamilyData = families.find(f => f.name === currentFamily)
  const availableMembers = currentFamilyData?.members.filter(m => 
    isParent ? m.role === "CHILD" : true
  ) || []

  const handleFamilySelect = (familyName: string) => {
    const family = families.find(f => f.name === familyName)
    if (!family) return

    // If parent, redirect to first child in family
    if (isParent) {
      const firstChild = family.members.find(m => m.role === "CHILD")
      if (firstChild) {
        router.push(`/${familyName}/${firstChild.username}`)
      }
    } else {
      // If child, redirect to their page in new family
      router.push(`/${familyName}/${currentUser}`)
    }
    setFamilyOpen(false)
  }

  const handleMemberSelect = (username: string) => {
    router.push(`/${currentFamily}/${username}`)
    setOpen(false)
  }

  return (
    <div className="flex space-x-2">
      {(isParent || families.length > 1) && (
        <Popover open={familyOpen} onOpenChange={setFamilyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {currentFamily}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search family..." />
              <CommandEmpty>No family found.</CommandEmpty>
              <CommandGroup>
                {families.map((family) => (
                  <CommandItem
                    key={family.id}
                    value={family.name}
                    onSelect={handleFamilySelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentFamily === family.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {family.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {isParent && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              {availableMembers.find(m => m.username === currentUser)?.name || currentUser}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search children..." />
              <CommandEmpty>No children found.</CommandEmpty>
              <CommandGroup>
                {availableMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.username}
                    onSelect={handleMemberSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentUser === member.username ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {member.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
} 