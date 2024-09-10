import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await auth()
    console.log("Session:", session)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.familyName) {
      return NextResponse.json({ error: "Family name is required" }, { status: 400 })
    }

    const { familyName } = body

    const newFamily = await prisma.family.create({
      data: {
        name: familyName,
        members: {
          create: {
            user: { connect: { id: session.user.id } },
            role: "PARENT",
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, family: newFamily })
  } catch (error) {
    console.error('Error creating family:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: "Failed to create family", details: error.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: "Failed to create family", details: "An unknown error occurred" }, { status: 500 })
    }
  }
}