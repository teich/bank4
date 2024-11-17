import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Category } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) 
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { familyMembers: true }
    })

    if (!user?.familyMembers.some(member => member.role === "PARENT"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { userId, weeks } = await request.json()
    if (!userId || !weeks || weeks < 1 || weeks > 52)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    // Get the family ID and current allowance settings
    const familyMember = await prisma.familyMember.findFirst({
      where: { userId }
    })

    if (!familyMember)
      return NextResponse.json({ error: "User not in family" }, { status: 400 })

    // Get the latest allowance settings for each category
    const allowanceSettings = await prisma.allowanceSetting.findMany({
      where: { 
        userId,
        familyId: familyMember.familyId 
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['category'],
    })

    if (allowanceSettings.length === 0)
      return NextResponse.json({ error: "No allowance settings found" }, { status: 400 })

    const now = new Date()
    const transactions = []

    for (let week = 0; week < weeks; week++) {
      for (const setting of allowanceSettings) {
        const date = new Date(now)
        date.setDate(date.getDate() - (week * 7))
        
        transactions.push({
          ownerId: userId,
          createdById: session.user.id!,
          familyId: familyMember.familyId,
          category: setting.category,
          amount: setting.amount, // Use the amount from settings (already in cents)
          description: `Weekly ${setting.category.toLowerCase()} allowance`,
          date,
          isSystemCreated: true
        })
      }
    }

    await prisma.transaction.createMany({
      data: transactions
    })

    revalidatePath(`/[familyName]/[userName]`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to generate test transactions:", error)
    return NextResponse.json(
      { error: "Failed to generate test transactions" },
      { status: 500 }
    )
  }
} 