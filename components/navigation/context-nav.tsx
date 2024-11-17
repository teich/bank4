"use client"

import { Home, Settings } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface ContextNavProps {
  familyName: string
  userName?: string
  currentPage?: "dashboard" | "settings"
  isParent?: boolean
}

export function ContextNav({ familyName, userName, currentPage, isParent }: ContextNavProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${familyName}/settings`}>
                {familyName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {userName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/${familyName}/${userName}`}>
                    {userName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {currentPage === "settings" && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  Settings
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

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
  )
} 