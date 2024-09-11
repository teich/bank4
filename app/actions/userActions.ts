'use server'

import { prisma } from '@/lib/prisma'

export async function checkUsernameStatus(userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const hasUsername = !!user?.username
    const needsUsernameSetup = !hasUsername
    return { hasUsername, needsUsernameSetup }
  } catch (error) {
    console.error('Error checking username status:', error)
    throw new Error('Failed to check username status')
  }
}