"use client"

import { ChevronRight, Home, Settings, User } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ContextNavProps {
  familyName: string
  userName?: string
  currentPage?: "dashboard" | "settings"
  isParent?: boolean
}

export function ContextNav({ familyName, userName, currentPage, isParent }: ContextNavProps) {
  return (
    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        <Home className="w-4 h-4" />
      </Link>
      
      <ChevronRight className="w-4 h-4" />
      
      <Link 
        href={`/${familyName}/settings`} 
        className="hover:text-foreground flex items-center gap-1"
      >
        {familyName}
      </Link>

      {userName && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link 
            href={`/${familyName}/${userName}`}
            className="hover:text-foreground flex items-center gap-1"
          >
            {userName}
          </Link>
        </>
      )}

      {currentPage === "settings" && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Settings</span>
        </>
      )}

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/${familyName}/settings`}>
                Family Settings
              </Link>
            </DropdownMenuItem>
            {userName && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/${familyName}/${userName}`}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isParent && (
                  <DropdownMenuItem asChild>
                    <Link href={`/${familyName}/${userName}/settings`}>
                      Allowance Settings
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 