import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const description =
  "login with Google only"

export default function LoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Login With Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button className="w-full">
              Login with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
