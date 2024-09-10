import { auth } from '@/auth'
import { PrismaClient } from "@prisma/client"
import InvitationPrompt from '@/components/InvitationPrompt'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function HandleInvitePage({
  searchParams,
}: {
  searchParams: { inviteId: string }
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const invite = await prisma.invite.findUnique({
    where: { id: searchParams.inviteId },
    include: { family: true }
  })

  if (!invite) {
    redirect('/create-family')
  }

  return <InvitationPrompt 
    invite={invite} 
    user={{
      id: session.user.id ?? '',
      email: session.user.email ?? '',
      name: session.user.name
    }} 
  />
}