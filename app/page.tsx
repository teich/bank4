import { auth } from '@/auth';
import { PrismaClient } from "@prisma/client";
import Link from 'next/link';

export default async function Home() {
  const prisma = new PrismaClient();
  const session = await auth();

  const userEmail = session?.user?.email;
  if (!userEmail) {
    return <p>Please sign in to view your families.</p>;
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { family: true },
  });

  if (!user || !user.family) {
    return <p>You are not a member of any family yet.</p>;
  }

    return (
      <ul>
        <li key={user.family.id}>
          <Link href={`/${user.family.name}/settings`}>
            {user.family.name}
          </Link>
        </li>
      </ul>
    );
}
