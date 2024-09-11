"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      Toggle theme
    </Button>
  )
}