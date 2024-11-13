import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getBaseUrl(request: Request) {
  const url = new URL(request.url)
  return `${url.protocol}//${url.host}`
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "Test endpoint only available in development" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { userId, weeksToSimulate = 1 } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    // Delete existing system-created transactions for this test
    await prisma.transaction.deleteMany({
      where: {
        ownerId: userId,
        isSystemCreated: true
      }
    })

    // Reset lastAllowanceRun to simulate first run
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastAllowanceRun: new Date(Date.now() - (weeksToSimulate * 7 * 24 * 60 * 60 * 1000)),
        lastAllowanceAttempt: null,
        allowanceRunCount: 0
      }
    })

    // Call the actual allowance run endpoint
    const baseUrl = getBaseUrl(request)
    console.log("Calling allowance run endpoint:", `${baseUrl}/api/allowance/run`)
    
    const allowanceResponse = await fetch(`${baseUrl}/api/allowance/run`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CRON_SECRET}`
      }
    })

    const result = await allowanceResponse.json()
    console.log("Allowance run result:", result)

    return NextResponse.json({
      success: true,
      weeksSimulated: weeksToSimulate,
      allowanceResult: result
    })

  } catch (error) {
    console.error("Test allowance run failed:", error)
    return NextResponse.json(
      { success: false, error: "Test allowance run failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 