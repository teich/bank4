import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function Page({ params }: { params: { familyName: string, userName: string } }) {
    const session = await auth()
    
    if (!session || !session.user) {
        redirect("/signin")
    }

    const familyMember = await prisma.familyMember.findFirst({
        where: {
            userId: session.user.id,
            family: { name: { equals: params.familyName, mode: 'insensitive' } }
        },
        select: {
            role: true,
            user: {
                select: { name: true }
            }
        }
    })

    if (!familyMember) {
        redirect("/") // Redirect to home if user isn't in the family
    }

    const isUsernameCaseInsensitiveMatch = 
        familyMember.user.name?.toLowerCase() === params.userName.toLowerCase()

    if (familyMember.role !== "PARENT" && !isUsernameCaseInsensitiveMatch) {
        redirect("/") // Redirect to home if user is a child and not on their own page
    }

    return (
        <div>Family Name: {params.familyName}, Person Name: {params.userName}</div>
    )
}