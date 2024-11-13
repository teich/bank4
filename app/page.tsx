import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PrismaClient } from "@prisma/client"

export default async function Home() {
  const session = await auth()
  const prisma = new PrismaClient()

  if (!session?.user?.email) {
    return <p>Please sign in to continue.</p>
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      familyMembers: {
        include: {
          family: true
        }
      }
    },
  })

  if (!user) return <p>User not found.</p>
  if (!user.username) redirect('/signup')

  // Check if user is a child in exactly one family
  const childFamilies = user.familyMembers.filter(member => member.role === 'CHILD')
  const parentFamilies = user.familyMembers.filter(member => member.role === 'PARENT')

  if (childFamilies.length === 1 && parentFamilies.length === 0) {
    // Child with single family
    redirect(`/${childFamilies[0].family.name}/${user.username}`)
  }

  // For parents, we need to check if they have exactly one child
  if (parentFamilies.length === 1 && childFamilies.length === 0) {
    const family = parentFamilies[0].family
    const familyChildren = await prisma.familyMember.findMany({
      where: {
        familyId: family.id,
        role: 'CHILD'
      },
      include: {
        user: true
      }
    })

    if (familyChildren.length === 1) {
      // Parent with single family and single child
      redirect(`/${family.name}/${familyChildren[0].user.username}`)
    }
  }

  // If no direct routing conditions met, go to profile
  redirect('/profile')
}
