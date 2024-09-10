import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId, familyId } = await request.json();

    console.log("memberId", memberId)
    console.log("familyId", familyId)   
  try {
    // Find the current user and check if they are a parent in the specified family
    const currentUserFamilyMember = await prisma.familyMember.findFirst({
      where: {
        user: { email: session.user.email },
        familyId: familyId,
        role: 'PARENT'
      },
      include: { family: true }
    });

    if (!currentUserFamilyMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the family member
    const deletedMember = await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: familyId
        }
      },
      include: { user: true }
    });

    return NextResponse.json({ message: 'Member removed from family', deletedMember });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
  }
}