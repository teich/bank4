import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AllowanceSettingsForm from "./AllowanceSettingsForm"
import Link from "next/link"
import { FamilySwitcher } from "@/app/components/family-switcher"

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

async function getUserFamilies(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      familyMembers: {
        include: {
          family: {
            include: {
              members: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      }
    }
  })

  return user?.familyMembers.map(member => ({
    id: member.family.id,
    name: member.family.name,
    members: member.family.members.map(m => ({
      id: m.user.id,
      name: m.user.name || m.user.username,
      username: m.user.username,
      role: m.role
    }))
  })) || []
}

export default async function Page({ params }: { params: { familyName: string, userName: string } }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const families = await getUserFamilies(session.user.email!)
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
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Allowance Settings for{" "}
          <Link 
            href={`/${params.familyName}/${params.userName}`}
            className="hover:text-blue-600 hover:underline"
          >
            {user.name || user.username}
          </Link>
        </h1>
        <FamilySwitcher
          families={families.map(family => ({
            id: family.id,
            name: family.name,
            members: family.members.map(member => ({
              id: member.id,
              name: member.name || '',
              username: member.username || '',
              role: member.role
            }))
          }))}
          currentFamily={params.familyName}
          currentUser={params.userName}
          isParent={isParentInFamily}
        />
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