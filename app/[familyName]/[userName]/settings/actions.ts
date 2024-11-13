"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AllowanceSettingSchema = z.object({
  category: z.enum(["SPENDING", "SAVING", "GIVING"]),
  amount: z.number().positive(),
  period: z.enum(["WEEK", "YEAR"]),
  isPercentage: z.boolean()
})

const SaveAllowanceSettingsSchema = z.object({
  familyId: z.string(),
  userId: z.string(),
  settings: z.array(AllowanceSettingSchema)
    .refine(settings => {
      return settings.every(setting => {
        if (setting.category === "SAVING") 
          return setting.period === "YEAR" && setting.isPercentage
        return setting.period === "WEEK" && !setting.isPercentage
      })
    }, "Invalid period or percentage settings for categories")
})

export async function saveAllowanceSettings(data: z.infer<typeof SaveAllowanceSettingsSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const { familyId, userId, settings } = SaveAllowanceSettingsSchema.parse(data)

  const sessionUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { familyMembers: true }
  })

  const isParentInFamily = sessionUser?.familyMembers.some(
    member => member.familyId === familyId && member.role === "PARENT"
  )

  if (!isParentInFamily) throw new Error("Unauthorized")
  if (!session.user.id) throw new Error("User ID is missing")

  const createdSettings = await Promise.all(
    settings.map(setting =>
      prisma.allowanceSetting.create({
        data: {
          ...setting,
          createdById: session.user!.id!,
          userId,
          familyId
        },
        include: {
          createdBy: {
            select: {
              name: true
            }
          }
        }
      })
    )
  )

  revalidatePath(`/${familyId}/${userId}/settings`)
  return createdSettings
}