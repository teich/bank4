import { auth } from '@/auth';
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';
import InvitationList from '@/components/InvitationList';

export default async function Home() {
  const prisma = new PrismaClient();
  const session = await auth();

  const userEmail = session?.user?.email;
  if (!userEmail) {
    return <p>Please sign in to view your families and invitations.</p>;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { 
      familyMembers: {
        include: {
          family: true
        }
      },
      createdInvites: true
    },
  });

  if (!user) {
    return <p>User not found.</p>;
  }

  // Fetch pending invites for the user
  const pendingInvites = await prisma.invite.findMany({
    where: {
      email: userEmail,
      status: 'PENDING'
    },
    include: {
      family: true
    }
  });

  return (
    <div>
      <h1>Your Families</h1>
      {user.familyMembers.length > 0 ? (
        <ul>
          {user.familyMembers.map(familyMember => (
            <li key={familyMember.family.id}>
              <Link href={`/${familyMember.family.name}/settings`}>
                {familyMember.family.name} - Role: {familyMember.role}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>You are not a member of any family yet.</p> 
          <Link href="/create-family">Create a family here</Link>
        </div>
      )}

      <h2>Pending Invitations</h2>
      <InvitationList invites={pendingInvites} />
    </div>
  );
}
