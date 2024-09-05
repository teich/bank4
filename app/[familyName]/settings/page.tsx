import { auth } from '@/auth';
import { PrismaClient } from "@prisma/client"
import { redirect } from 'next/navigation';

const prisma = new PrismaClient()

export default async function Page({ params }: { params: { familyName: string } }) {
  const session = await auth();

  // check if user is in family, if not, redirect to home  
  const family = await prisma.family.findUnique({
    where: { name: params.familyName, },
    include: { members: true, },
  });
  if (!family || !family.members.some(member => member.email === session?.user?.email)) {
    redirect('/');
  }
  return <div>Settings for Family Name: {params.familyName}</div>
}