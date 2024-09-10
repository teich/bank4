'use server'

import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";
import { Role } from '@prisma/client';

type InviteResult = {
  success: boolean;
  message?: string;
};

export async function inviteFamilyMember({ email, role, familyName }: { email: string; role: string; familyName: string }): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // Validate role
    const upperRole = role.toUpperCase();
    if (upperRole !== 'PARENT' && upperRole !== 'CHILD') {
      console.log('Invalid role:', role);
      return { success: false, message: 'Invalid role' };
    }

    // Find the family
    const family = await prisma.family.findUnique({
      where: { name: familyName },
      include: { members: true },
    });

    if (!family) {
      return { success: false, message: 'Family not found' };
    }

    // Check if the current user is a parent in this family
    const isParent = family.members.some(member => 
      member.userId === session?.user?.id && member.role === 'PARENT'
    );

    if (!isParent) {
      return { success: false, message: 'Only parents can send invites' };
    }

    // Create the invite
    const invite = await prisma.invite.create({
      data: {
        email,
        role: upperRole as Role,
        family: { connect: { id: family.id } },
        createdBy: { connect: { id: session.user.id } },
      },
    });

    // TODO: Send email invitation

    return { success: true, message: 'Invitation created successfully' };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return { success: false, message: 'Failed to create invitation' };
  }
}