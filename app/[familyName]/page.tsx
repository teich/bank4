import { auth } from '@/auth'
import { redirect } from 'next/navigation';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function Page({ params }: { params: { familyName: string } }) {
  const session = await auth();

  const family = await prisma.family.findUnique({
    where: { name: params.familyName, },
    include: { members: true, },
  });
  if (!family || !family.members.some(member => member.email === session?.user?.email)) {
    redirect('/');
  } else {
    return <div>Family Name: {params.familyName}</div>
  }
}