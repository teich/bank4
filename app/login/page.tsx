import { auth } from '@/auth';
import { PrismaClient } from "@prisma/client"
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function LoginPage() {
  // TODO: this is all commented out because I think with Authjs we don't really use this much
  // maybe this kind of logic can be elsewhere?

  // console.log("ARE WE EVER HERE")
  const session = await auth();

  if (session?.user) {
    redirect('/');
  } else {


  //   if (!user) {
  //     // New user, create them in the database
  //     user = await prisma.user.create({
  //       data: {
  //         email: session.user.email!,
  //         name: session.user.name || null,
  //       },
  //     });
  //   }

      // else {
  //     // Check for pending invites
  //     const pendingInvite = await prisma.invite.findFirst({
  //       where: { email: user.email, status: 'PENDING' },
  //       include: { family: true }
  //     });

  //     if (pendingInvite) {
  //       return <InvitationPrompt invite={pendingInvite} user={user} />;
  //     } else {
  //       redirect('/create-family');
  //     }
  //   }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button asChild>
        <a href="/api/auth/signin">Sign In</a>
      </Button>
    </div>
  );
  }
}
