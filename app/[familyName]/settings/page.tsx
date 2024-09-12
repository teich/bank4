import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import InviteMemberForm from '@/app/[familyName]/settings/InviteMemberForm';
import FamilyInvites from '@/app/[familyName]/settings/FamilyInvites';
import FamilyMembersList from '@/app/[familyName]/settings/FamilyMembersList';
import Link from 'next/link';

export default async function Page({ params }: { params: { familyName: string } }) {
  const session = await auth();

  // check if user is in family, if not, redirect to home  
  const family = await prisma.family.findUnique({
    where: { name: params.familyName },
    include: { 
      members: {
        include: { user: true }
      },
    },
  });
  if (!family || !family.members.some(member => member.user.email === session?.user?.email)) {
    redirect('/');
  }
  const familyMember = family.members.find(member => member.user.email === session?.user?.email);

  // Fetch invites for this family
  const invites = await prisma.invite.findMany({
    where: { 
      familyId: family.id,
      status: { not: 'DELETED' } // Use string literal
    },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['email'],
  });

  const isParent = familyMember?.role === 'PARENT';

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Family Settings: {params.familyName}</h1>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/10">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${family.name}`} />
              <AvatarFallback>{family.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{family.name}</CardTitle>
              <p className="text-sm text-muted-foreground">Created on {new Date(family.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
          <div>
            <h3 className="font-semibold mb-2">Your Information</h3>
            <p><strong>Name:</strong> {familyMember?.user.name ?? 'N/A'}</p>
            <p><strong>Email:</strong> {familyMember?.user.email ?? 'N/A'}</p>
            <p><strong>Role:</strong> {familyMember?.role ?? 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Family Stats</h3>
            <p><strong>Total Members:</strong> {family.members.length}</p>
            <p><strong>Parents:</strong> {family.members.filter(m => m.role === 'PARENT').length}</p>
            <p><strong>Children:</strong> {family.members.filter(m => m.role === 'CHILD').length}</p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Family Members</h2>
        <Card>
          <CardContent className="p-6">
            <FamilyMembersList 
              members={family.members.map(m => ({ 
                ...m.user, 
                role: m.role,
                link: `/${params.familyName}/${m.user.username}`, // Changed to use username
                username: m.user.username
              }))}
              currentUserEmail={session?.user?.email || ''} 
              isParent={isParent}
              familyId={family.id}
            />
          </CardContent>
        </Card>
      </section>

      {isParent && (
        <>
          <Separator className="my-8" />
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Invite New Family Member</h2>
            <Card>
              <CardContent className="p-6">
                <InviteMemberForm familyName={params.familyName} />
              </CardContent>
            </Card>
          </section>

          <Separator className="my-8" />

          <section>
            <h2 className="text-2xl font-semibold mb-4">Family Invites</h2>
            <Card>
              <CardContent className="p-6">
                <FamilyInvites invites={invites} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}