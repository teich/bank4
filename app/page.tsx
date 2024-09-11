import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PrismaClient } from "@prisma/client"
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import InvitationList from '@/app/[familyName]/settings/InvitationList'
import { CreateFamilyModal } from '@/app/components/CreateFamilyModal'

export default async function Home() {
  const prisma = new PrismaClient()
  const session = await auth()

  const userEmail = session?.user?.email
  if (!userEmail) {
    return <p>Please sign in to view your families and invitations.</p>
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { 
      familyMembers: {
        include: {
          family: true
        }
      },
      createdInvites: true
    },
  })

  if (!user) {
    return <p>User not found.</p>
  }

  // Check if the user has a username set
  if (!user.username) {
    redirect('/signup')
  }

  // Fetch pending invites for the user
  const pendingInvites = await prisma.invite.findMany({
    where: {
      email: userEmail,
      status: 'PENDING'
    },
    include: {
      family: true
    }
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            {user.username && (
              <p className="text-sm text-gray-600">@{user.username}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Families</CardTitle>
          <CreateFamilyModal />
        </CardHeader>
        <CardContent>
          {user.familyMembers.length > 0 ? (
            <ul className="space-y-2">
              {user.familyMembers.map(familyMember => (
                <li key={familyMember.family.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link href={`/${familyMember.family.name}/${user.username}`} className="text-blue-600 hover:underline">
                      {familyMember.family.name}
                    </Link>
                    <span className="text-sm text-gray-500">({familyMember.role})</span>
                  </div>
                  <Link href={`/${familyMember.family.name}/settings`} className="text-sm text-blue-500 hover:underline">
                    Settings
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not a member of any family yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationList invites={pendingInvites} />
        </CardContent>
      </Card>
    </div>
  )
}
