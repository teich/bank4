import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth"

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  const { inviteId } = await request.json();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if the invite is for the current user
    if (invite.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the invite status to 'REJECTED'
    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ success: true, invite: updatedInvite });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 });
  }
}