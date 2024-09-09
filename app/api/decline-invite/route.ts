import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { inviteId } = await request.json();

  try {
    await prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 });
  }
}