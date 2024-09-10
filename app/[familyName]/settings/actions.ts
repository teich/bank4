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

export async function acceptInvite(inviteId: string): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return { success: false, message: 'Invite not found' };
    }

    await prisma.$transaction([
      prisma.familyMember.create({
        data: {
          user: { connect: { id: session.user.id } },
          family: { connect: { id: invite.familyId } },
          role: invite.role,
        },
      }),
      prisma.invite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    return { success: true, message: 'Invitation accepted successfully' };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, message: 'Failed to accept invitation' };
  }
}

export async function declineInvite(inviteId: string): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return { success: false, message: 'Invite not found' };
    }

    if (invite.email !== session.user.email) {
      return { success: false, message: 'Unauthorized' };
    }

    await prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });

    return { success: true, message: 'Invitation declined successfully' };
  } catch (error) {
    console.error('Error declining invitation:', error);
    return { success: false, message: 'Failed to decline invitation' };
  }
}

type DeleteMemberResult = {
  success: boolean;
  message?: string;
};

export async function deleteFamilyMember(memberId: string, familyId: string): Promise<DeleteMemberResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // Find the current user and check if they are a parent in the specified family
    const currentUserFamilyMember = await prisma.familyMember.findFirst({
      where: {
        user: { email: session.user.email },
        familyId: familyId,
        role: 'PARENT'
      },
      include: { family: true }
    });

    if (!currentUserFamilyMember) {
      return { success: false, message: 'Unauthorized' };
    }

    // Delete the family member
    await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId: memberId,
          familyId: familyId
        }
      }
    });

    return { success: true, message: 'Member removed from family' };
  } catch (error) {
    console.error('Error deleting family member:', error);
    return { success: false, message: 'Failed to delete family member' };
  }
}

type DeleteInviteResult = {
  success: boolean;
  message?: string;
};

export async function deleteInvite(inviteId: string): Promise<DeleteInviteResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // Find the current user and their family memberships
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        familyMembers: {
          include: { family: true }
        }
      },
    });

    if (!currentUser) {
      return { success: false, message: 'User not found' };
    }

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: { family: true },
    });

    if (!invite) {
      return { success: false, message: 'Invite not found' };
    }

    // Check if the user is a parent in the family associated with the invite
    const isParentInFamily = currentUser.familyMembers.some(
      member => member.familyId === invite.familyId && member.role === 'PARENT'
    );

    if (!isParentInFamily) {
      return { success: false, message: 'Unauthorized' };
    }

    // Update the invite status to 'DELETED'
    await prisma.invite.update({
      where: { id: inviteId },
      data: { status: 'DELETED' },
    });

    return { success: true, message: 'Invite marked as deleted' };
  } catch (error) {
    console.error('Error deleting invite:', error);
    return { success: false, message: 'Failed to delete invite' };
  }
}