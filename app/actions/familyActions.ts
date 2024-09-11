'use server'

import { PrismaClient } from "@prisma/client"
import { auth } from '@/auth'

const prisma = new PrismaClient()

export async function createFamily({ name }: { name: string }) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const family = await prisma.family.create({
    data: {
      name,
      members: {
        create: {
          userId: user.id,
          role: 'PARENT',
        },
      },
    },
  })

  return family
}

export async function checkFamilyNameAvailability(name: string): Promise<boolean> {
  const existingFamily = await prisma.family.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  })

  return !existingFamily
}