import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { inviteId, userId } = await request.json();

  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          familyId: invite.familyId,
          role: invite.role,
        },
      }),
      prisma.invite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}