import { signIn, signOut, auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { UserIcon, LogOutIcon } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'


export default async function SignIn() {
    const session = await auth()

    if (!session?.user) {
        return (
            <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
            >
            <Button type="submit" variant="outline" size="sm">
                <UserIcon className="w-4 h-4 mr-2" />
                Sign in with Google
            </Button>
            </form>
        );
    } else {
 
        return (
            <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{session.user.name}</span>
                <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
                >
                <Button type="submit" variant="outline" size="sm">
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
                </form>
            </div>
        );
    }
}