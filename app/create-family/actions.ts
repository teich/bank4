'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export async function checkFamilyName(name: string): Promise<boolean> {
  const existingFamily = await prisma.family.findUnique({
    where: { name },
  })
  return !existingFamily
}

export async function createFamily(familyName: string): Promise<boolean> {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      console.error('User not authenticated')
      redirect('/login')
    }

    const userId = session.user.id

    const family = await prisma.family.create({
      data: { 
        name: familyName,
        members: {
          create: {
            userId: userId,
            role: 'PARENT'
          }
        }
      },
    })

    return true
  } catch (error) {
    console.error('Error creating family:', error)
    return false
  }
}