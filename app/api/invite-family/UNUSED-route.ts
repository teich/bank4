import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';
import { auth } from "@/auth"

const prisma = new PrismaClient();

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { email, role, familyName } = await request.json();

		// Validate role
    const upperRole = role.toUpperCase();
		if (upperRole !== 'PARENT' && upperRole !== 'CHILD') {
			console.log('Invalid role:', role);
			return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
		}

		// Find the family
		const family = await prisma.family.findUnique({
			where: { name: familyName },
			include: { members: true },
		});

		if (!family) {
			return NextResponse.json({ error: 'Family not found' }, { status: 404 });
		}

		// Check if the current user is a parent in this family
		const isParent = session.user && family.members.some(member => 
			member.userId === session?.user?.id && member.role === 'PARENT'
		);

		if (!isParent) {
			return NextResponse.json({ error: 'Only parents can send invites' }, { status: 403 });
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

		return NextResponse.json({ success: true, invite });
	} catch (error) {
		console.error('Error creating invite:', error);
		return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
	}
}