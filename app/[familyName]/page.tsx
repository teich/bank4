import { auth } from '@/auth'
import { redirect } from 'next/navigation';
import { prisma } from "@/lib/prisma"

export default async function Page({ params }: { params: { familyName: string } }) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const family = await prisma.family.findUnique({
    where: { name: params.familyName },
    include: { 
      members: {
        include: { user: true }
      }
    },
  });

  if (!family || !family.members.some((member: { user: { id: string } }) => member.user.id === session.user!.id)) {
    redirect('/');
  } else {
    return <div>Family Name: {params.familyName}</div>
  }
}