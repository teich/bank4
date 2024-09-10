import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import InviteMemberForm from '@/app/[familyName]/settings/InviteMemberForm';
import FamilyInvites from '@/app/[familyName]/settings/FamilyInvites';
import FamilyMembersList from '@/app/[familyName]/settings/FamilyMembersList';

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
      status: { not: 'DELETED' } // Only fetch non-deleted invites
    },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['email'],
  });

  const isParent = familyMember?.role === 'PARENT';

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Settings for Family: {params.familyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold">User Information</h2>
          <p><strong>Name:</strong> {familyMember?.user.name ?? 'N/A'}</p>
          <p><strong>Email:</strong> {familyMember?.user.email ?? 'N/A'}</p>
          <p><strong>Role:</strong> {familyMember?.role ?? 'N/A'}</p>
        </CardContent>
        <CardContent>
          <h2 className="text-lg font-semibold">Family Information</h2>
          <p><strong>Family Name:</strong> {family.name}</p>
          <p><strong>Created At:</strong> {new Date(family.createdAt).toLocaleDateString()}</p>
          <p><strong>Updated At:</strong> {new Date(family.updatedAt).toLocaleDateString()}</p>
        </CardContent>
        <CardContent>
          <h2 className="text-lg font-semibold">Family Members</h2>
          <FamilyMembersList 
            members={family.members.map(m => ({ ...m.user, role: m.role }))}
            currentUserEmail={session?.user?.email || ''} 
            isParent={isParent}
            familyId={family.id} // Make sure you're passing the familyId here
          />
        </CardContent>
        
        {isParent && (
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Invite New Family Member</h2>
            <InviteMemberForm familyName={params.familyName} />
          </CardContent>
        )}

        {isParent && (
          <CardContent>
            <FamilyInvites invites={invites} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}