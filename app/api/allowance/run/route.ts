import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { Category } from "@prisma/client"

const MIN_HOURS_BETWEEN_RUNS = 12
const CRON_SECRET = process.env.CRON_SECRET

interface AllowanceCalculation {
  spending: number
  saving: number
  giving: number
}

async function calculateWeeklyAllowance({
  spendingAmount,    // in cents
  savingPercent,     // in basis points (2000 = 20%)
  givingAmount,      // in cents
  weeksToRun,
  userId,
  familyId
}: {
  spendingAmount: number
  savingPercent: number
  givingAmount: number
  weeksToRun: number
  userId: string
  familyId: string
}): Promise<AllowanceCalculation> {
  // Get current savings balance
  const currentSavings = await prisma.transaction.aggregate({
    where: {
      ownerId: userId,
      familyId: familyId,
      category: Category.SAVING
    },
    _sum: {
      amount: true
    }
  })

  const principal = currentSavings._sum.amount || 0
  
  // Convert basis points to decimal (2000 -> 0.20)
  const annualRate = savingPercent / 10000
  
  // Calculate weekly interest rate
  const weeklyRate = annualRate / 52
  
  // Compound interest formula: A = P(1 + r)^t
  // Where:
  // P = Principal (current savings balance)
  // r = Weekly interest rate
  // t = Number of weeks
  const finalAmount = principal * Math.pow(1 + weeklyRate, weeksToRun)
  const savingsIncrease = Math.round(finalAmount - principal)
  
  return {
    spending: spendingAmount * weeksToRun,
    saving: savingsIncrease,
    giving: givingAmount * weeksToRun
  }
}

export async function POST() {
  try {
    // Verify authorization in production only
    if (process.env.NODE_ENV === "production") {
      const headersList = headers()
      const authHeader = headersList.get("authorization")
      
      if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
        console.error("Unauthorized allowance run attempt")
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    const now = new Date()
    const results = []
    const logs = []

    // Get all users with allowance settings
    const users = await prisma.user.findMany({
      where: {
        allowanceSettings: {
          some: {} // Has any allowance settings
        }
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        lastAllowanceRun: true,
        lastAllowanceAttempt: true,
        familyMembers: {
          include: {
            family: true
          }
        },
        allowanceSettings: {
          orderBy: {
            createdAt: 'desc'
          },
          distinct: ['category']
        }
      }
    })

    console.log(`Processing allowances for ${users.length} users`)

    for (const user of users) {
      try {
        const familyMember = user.familyMembers[0]
        if (!familyMember) continue

        // Rate limiting check
        if (user.lastAllowanceAttempt) {
          const hoursSinceLastRun = (now.getTime() - user.lastAllowanceAttempt.getTime()) / (60 * 60 * 1000)
          if (hoursSinceLastRun < MIN_HOURS_BETWEEN_RUNS) continue
        }

        const startDate = user.lastAllowanceRun || user.createdAt
        const weeksToRun = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        
        if (weeksToRun === 0) continue

        // Get latest settings
        const spendingSetting = user.allowanceSettings.find(s => s.category === Category.SPENDING)
        const savingSetting = user.allowanceSettings.find(s => s.category === Category.SAVING)
        const givingSetting = user.allowanceSettings.find(s => s.category === Category.GIVING)

        if (!spendingSetting || !savingSetting || !givingSetting) continue

        const allowance = await calculateWeeklyAllowance({
          spendingAmount: spendingSetting.amount,
          savingPercent: savingSetting.amount,
          givingAmount: givingSetting.amount,
          weeksToRun,
          userId: user.id,
          familyId: familyMember.familyId
        })

        // Create transactions and log in a single transaction
        const result = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              description: `Allowance - Spending (${weeksToRun} weeks)`,
              date: now,
              amount: allowance.spending,
              category: Category.SPENDING,
              createdById: user.id,
              ownerId: user.id,
              familyId: familyMember.familyId,
              isSystemCreated: true
            }
          }),
          prisma.transaction.create({
            data: {
              description: `Allowance - Saving (${weeksToRun} weeks)`,
              date: now,
              amount: allowance.saving,
              category: Category.SAVING,
              createdById: user.id,
              ownerId: user.id,
              familyId: familyMember.familyId,
              isSystemCreated: true
            }
          }),
          prisma.transaction.create({
            data: {
              description: `Allowance - Giving (${weeksToRun} weeks)`,
              date: now,
              amount: allowance.giving,
              category: Category.GIVING,
              createdById: user.id,
              ownerId: user.id,
              familyId: familyMember.familyId,
              isSystemCreated: true
            }
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { 
              lastAllowanceRun: now,
              lastAllowanceAttempt: now,
              allowanceRunCount: { increment: 1 }
            }
          })
        ])

        results.push({
          userId: user.id,
          weeksProcessed: weeksToRun,
          transactions: result
        })

        if (user.username) {
          revalidatePath(`/${familyMember.family.name}/${user.username}`)
        }

      } catch (error) {
        console.error(`Error processing allowance for user ${user.id}:`, error)
        logs.push({
          userId: user.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      processedCount: results.length,
      totalUsers: users.length,
      logs 
    })

  } catch (error) {
    console.error("Failed to run allowances:", error)
    return NextResponse.json(
      { success: false, error: "Failed to run allowances" },
      { status: 500 }
    )
  }
} 