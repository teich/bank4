import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { inviteId } = await request.json();

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { family: true },
    });

    if (!currentUser || !currentUser.family || currentUser.role !== 'PARENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({ message: 'Invite marked as deleted', updatedInvite });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json({ error: 'Failed to delete invite' }, { status: 500 });
  }
}