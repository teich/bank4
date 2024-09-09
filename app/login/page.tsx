import { auth } from '@/auth';
import { PrismaClient } from "@prisma/client"
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import InvitationPrompt from '@/components/InvitationPrompt';

const prisma = new PrismaClient()

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    let user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { family: true }
    });

    if (!user) {
      // New user, create them in the database
      user = await prisma.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name || null,
        },
      });
    }

    if (user.family) {
      redirect(`/${user.family.name}`);
    } else {
      // Check for pending invites
      const pendingInvite = await prisma.invite.findFirst({
        where: { email: user.email, status: 'PENDING' },
        include: { family: true }
      });

      if (pendingInvite) {
        return <InvitationPrompt invite={pendingInvite} user={user} />;
      } else {
        redirect('/create-family');
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button asChild>
        <a href="/api/auth/signin">Sign In</a>
      </Button>
    </div>
  );
}
