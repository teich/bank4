import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { memberId } = await request.json();

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { family: true },
    });

    if (!currentUser || !currentUser.family || currentUser.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedMember = await prisma.user.update({
      where: { id: memberId },
      data: { familyId: null },
    });

    return NextResponse.json({ message: 'Member removed from family', deletedMember });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
  }
}