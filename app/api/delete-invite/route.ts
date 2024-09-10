import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { inviteId } = await request.json();

  try {
    // Find the current user and their family memberships
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        familyMembers: {
          include: { family: true }
        }
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if the user is a parent in the family associated with the invite
    const isParentInFamily = currentUser.familyMembers.some(
      member => member.familyId === invite.familyId && member.role === 'PARENT'
    );

    if (!isParentInFamily) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the invite status to 'DELETED'
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