import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { auth } from "@/auth" // Referring to the auth.ts we just created

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await auth();
  const { inviteId } = await request.json();

  if (!session?.user?.id) {
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

    await prisma.$transaction([
      prisma.familyMember.create({
        data: {
          user: { connect: { id: session.user.id } },
          family: { connect: { id: invite.familyId } },
          role: invite.role as Role,
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