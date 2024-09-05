import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  
  if (!name) {
    return NextResponse.json({ error: "Name parameter is required" }, { status: 400 })
  }

  const existingFamily = await prisma.family.findUnique({ where: { name } })
  return NextResponse.json({ isAvailable: !existingFamily })
}