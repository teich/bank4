'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Invite } from '@prisma/client';

interface InvitationPromptProps {
  invite: Invite & { family: { name: string } };
  user: { id: string; email: string; name?: string | null };
}

export default function InvitationPrompt({ invite, user }: InvitationPromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.id, userId: user.id }),
      });

      if (response.ok) {
        router.push(`/${invite.family.name}`);
      } else {
        throw new Error('Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/decline-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.id }),
      });

      if (response.ok) {
        router.push('/create-family');
      } else {
        throw new Error('Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Family Invitation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          You've been invited to join the family "{invite.family.name}" with the role of {invite.role}.
        </p>
        <div className="flex justify-between">
          <Button onClick={handleAccept} disabled={isLoading}>
            Accept
          </Button>
          <Button onClick={handleDecline} variant="outline" disabled={isLoading}>
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}