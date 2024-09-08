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
      family: true,
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
      <h1>Your Family</h1>
      {user.family ? (
        <ul>
          <li key={user.family.id}>
            <Link href={`/${user.family.name}/settings`}>
              {user.family.name}
            </Link>
          </li>
        </ul>
      ) : (
        <p>You are not a member of any family yet.</p>
      )}

      <h2>Pending Invitations</h2>
      <InvitationList invites={pendingInvites} />
    </div>
  );
}
