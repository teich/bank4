import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server"
import { auth } from "@/auth"

const prisma = new PrismaClient();

export async function POST(request: Request) {

  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const family = await prisma.family.findUnique({
      where: { name: body.familyName },
      include: { members: true },
    });

    if (!family) {
      return NextResponse.json({ error: "Family Not Found" }, { status: 404 })
    }

    const user = family.members.find(member => member.email === session.user?.email);
    if (!user) {
      return NextResponse.json({ error: "Not member of this family" }, { status: 403 })
    }

    const invite = await prisma.invite.create({
      data: {
        email: body.email,
        role: body.role,
        family: { connect: { id: family.id } },
        createdBy: { connect: { id: user.id } },
      },
    });

    return NextResponse.json({ message: "Invite Created Sucessfully" }, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ message: "error creating invite" }, { status: 500 })
  }
}