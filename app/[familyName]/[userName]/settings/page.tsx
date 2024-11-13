import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AllowanceSettingsForm from "./AllowanceSettingsForm"
import Link from "next/link"

async function getFamily(familyName: string) {
  return await prisma.family.findUnique({
    where: { name: familyName },
    include: { members: true }
  })
}

async function getUser(userName: string) {
  return await prisma.user.findUnique({
    where: { username: userName }
  })
}

async function getAllowanceSettings(familyId: string, userId: string) {
  return await prisma.allowanceSetting.findMany({
    where: { familyId, userId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          name: true,
          username: true
        }
      }
    }
  })
}

export default async function Page({ params }: { params: { familyName: string, userName: string } }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const family = await getFamily(params.familyName)
  if (!family) throw new Error("Family not found")

  const user = await getUser(params.userName)
  if (!user) throw new Error("User not found")

  const sessionUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { familyMembers: true }
  })

  const isParentInFamily = sessionUser?.familyMembers.some(
    member => member.familyId === family.id && member.role === "PARENT"
  )

  if (!isParentInFamily) throw new Error("Unauthorized")

  const allowanceSettings = await getAllowanceSettings(family.id, user.id)

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Allowance Settings for{" "}
          <Link 
            href={`/${params.familyName}/${params.userName}`}
            className="hover:text-primary hover:underline"
          >
            {user.name || user.username}
          </Link>
        </h1>
      </div>
      <AllowanceSettingsForm
        initialSettings={allowanceSettings.map(setting => ({
          ...setting,
          createdBy: {
            name: setting.createdBy.name || setting.createdBy.username || ''
          }
        }))}
        familyId={family.id}
        userId={user.id}
        currency={family.currency}
      />
    </div>
  )
}