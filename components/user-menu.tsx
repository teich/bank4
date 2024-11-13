"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { User } from "@/lib/types"
import { LogOut, User as UserIcon, Moon, Sun, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const { setTheme, theme } = useTheme()
  const isAdmin = user.email === 'oren@teich.net'

  const initials = user.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase() || user.email?.[0].toUpperCase() || "?"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user.image || ''} alt={user.name || ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => signOut()}
          className="text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 