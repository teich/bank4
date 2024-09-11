'use server'

import { prisma } from '@/lib/prisma'
import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'

export async function checkUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username } })
  return { available: !user }
}

export async function submitUsername(username: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      redirect('/api/auth/signin')
    }
    
    if (!session.user.email) {
      return { success: false, error: 'User email not found' }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { username }
    })

    if (updatedUser) {
      return { success: true }
      }
     else {
      return { success: false, error: 'Failed to update username' }
    }
  } catch (error) {
    console.error('Error submitting username:', error)
    return { success: false, error: 'Failed to create username' }
  }
}